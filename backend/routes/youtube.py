import os
import math
from datetime import datetime, timezone, timedelta

import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from pymongo import MongoClient


load_dotenv()

youtube = Blueprint("youtube", __name__)

YOUTUBE_API_URL = (
    "https://www.googleapis.com/youtube/v3"
)


# ============================================================
# MONGODB CACHE
# ============================================================

MONGO_URI = os.getenv("MONGO_URI")

mongo_client = MongoClient(MONGO_URI)

db = mongo_client["JobTrendAI"]

youtube_cache_collection = db[
    "youtube_recommendations_cache"
]


# Cache successful YouTube recommendations
# for 24 hours.
CACHE_HOURS = 24


# ============================================================
# HELPERS
# ============================================================

def get_api_key():
    return os.getenv("YOUTUBE_API_KEY")


def normalize_skill(skill):
    """
    Normalize common skill names so the YouTube
    search receives clean queries.
    """

    aliases = {
        "artificial intelligence": "AI",
        "machine learning": "Machine Learning",
        "natural language processing": "NLP",
        "large language models": "LLMs",
        "large language model": "LLMs",
        "scikit learn": "Scikit-learn",
        "scikit-learn": "Scikit-learn",
        "nodejs": "Node.js",
        "java script": "JavaScript",
    }

    cleaned = (
        str(skill)
        .strip()
        .lower()
    )

    return aliases.get(
        cleaned,
        str(skill).strip()
    )


def calculate_relevance_score(
    title,
    description,
    skill
):
    """
    Transparent keyword relevance score.
    """

    text = (
        f"{title} {description}"
    ).lower()

    skill_words = (
        skill.lower()
        .replace("-", " ")
        .replace(".", " ")
        .split()
    )

    if not skill_words:
        return 0

    matches = 0

    for word in skill_words:

        if word in text:
            matches += 1

    score = (
        matches /
        len(skill_words)
    ) * 100

    return round(
        min(score, 100),
        2
    )


def calculate_engagement_score(
    views,
    likes
):
    """
    Estimate engagement using likes relative
    to views.
    """

    if not views or views <= 0:
        return 0

    if not likes:
        return 0

    like_ratio = (
        likes / views
    ) * 100

    score = min(
        like_ratio * 10,
        100
    )

    return round(
        score,
        2
    )


def calculate_popularity_score(
    views,
    likes,
    relevance
):
    """
    Popularity combines:
    - logarithmic views
    - engagement
    - relevance
    """

    if views <= 0:

        view_score = 0

    else:

        view_score = min(
            math.log10(views) /
            8 *
            100,
            100
        )

    engagement = (
        calculate_engagement_score(
            views,
            likes
        )
    )

    score = (
        view_score * 0.50
        +
        engagement * 0.20
        +
        relevance * 0.30
    )

    return round(
        score,
        2
    )


def calculate_underrated_score(
    views,
    likes,
    relevance
):
    """
    Hidden-gem score rewards:
    - strong relevance
    - good engagement
    - lower visibility

    Low views alone are NOT enough.
    """

    if views <= 0:

        visibility_score = 100

    else:

        view_score = min(
            math.log10(views) /
            8 *
            100,
            100
        )

        visibility_score = (
            100 -
            view_score
        )

    engagement = (
        calculate_engagement_score(
            views,
            likes
        )
    )

    score = (
        relevance * 0.40
        +
        engagement * 0.35
        +
        visibility_score * 0.25
    )

    return round(
        score,
        2
    )


def format_duration(seconds):
    """
    Convert seconds into readable duration.
    """

    try:

        seconds = int(seconds)

    except (
        TypeError,
        ValueError
    ):

        return "Unknown"

    hours = (
        seconds // 3600
    )

    minutes = (
        seconds % 3600
    ) // 60

    if hours > 0:

        return (
            f"{hours}h "
            f"{minutes}m"
        )

    return f"{minutes}m"


def calculate_recency_score(
    published_at
):
    """
    Newer educational content gets a
    modest recency boost.
    """

    try:

        published = (
            datetime.fromisoformat(
                published_at.replace(
                    "Z",
                    "+00:00"
                )
            )
        )

        now = datetime.now(
            timezone.utc
        )

        days_old = (
            now - published
        ).days

        if days_old <= 30:
            return 100

        if days_old <= 90:
            return 90

        if days_old <= 180:
            return 80

        if days_old <= 365:
            return 70

        if days_old <= 730:
            return 55

        return 40

    except Exception:

        return 50


# ============================================================
# CACHE FUNCTIONS
# ============================================================

def get_cached_recommendations(
    skill
):
    """
    Return cached recommendations if
    they are still fresh.
    """

    try:

        normalized = normalize_skill(
            skill
        )

        cached = (
            youtube_cache_collection.find_one(
                {
                    "skill": normalized
                },
                {
                    "_id": 0
                }
            )
        )

        if not cached:

            return None

        cached_at = cached.get(
            "cached_at"
        )

        if not cached_at:

            return None

        # Handle MongoDB datetime.
        if isinstance(
            cached_at,
            datetime
        ):

            age = (
                datetime.now(
                    timezone.utc
                )
                -
                cached_at
            )

            if age < timedelta(
                hours=CACHE_HOURS
            ):

                return cached.get(
                    "data"
                )

        return None

    except Exception as error:

        print(
            "YOUTUBE CACHE READ ERROR:",
            error
        )

        return None


def save_cached_recommendations(
    skill,
    data
):
    """
    Store successful recommendations
    in MongoDB.
    """

    try:

        normalized = normalize_skill(
            skill
        )

        youtube_cache_collection.update_one(
            {
                "skill": normalized
            },
            {
                "$set": {
                    "skill": normalized,
                    "data": data,
                    "cached_at": datetime.now(
                        timezone.utc
                    )
                }
            },
            upsert=True
        )

        print(
            f"YOUTUBE CACHE SAVED: {normalized}"
        )

    except Exception as error:

        print(
            "YOUTUBE CACHE SAVE ERROR:",
            error
        )


# ============================================================
# SEARCH YOUTUBE
# ============================================================

def search_youtube_videos(skill):

    api_key = get_api_key()

    if not api_key:

        raise RuntimeError(
            "YOUTUBE_API_KEY is not configured"
        )

    params = {

        "part": "snippet",

        "q": (
            f"{skill} "
            f"tutorial course"
        ),

        "type": "video",

        # Reduced from 20.
        "maxResults": 10,

        "order": "relevance",

        "videoDuration": "medium",

        "videoEmbeddable": "true",

        "relevanceLanguage": "en",

        "regionCode": "IN",

        "key": api_key
    }


    response = requests.get(

        f"{YOUTUBE_API_URL}/search",

        params=params,

        timeout=15
    )


    if response.status_code == 429:

        print(
            "YOUTUBE QUOTA EXCEEDED"
        )

        raise RuntimeError(
            "YouTube daily search quota has been exceeded. "
            "Please try again after the quota resets."
        )


    if not response.ok:

        print(
            "YOUTUBE SEARCH ERROR:",
            response.text
        )

        raise RuntimeError(
            "YouTube search request failed"
        )


    return response.json()


# ============================================================
# GET VIDEO STATISTICS
# ============================================================

def get_video_details(
    video_ids
):

    if not video_ids:

        return []

    api_key = get_api_key()

    params = {

        "part": (
            "snippet,"
            "statistics,"
            "contentDetails"
        ),

        "id": ",".join(
            video_ids
        ),

        "key": api_key
    }


    response = requests.get(

        f"{YOUTUBE_API_URL}/videos",

        params=params,

        timeout=15
    )


    if not response.ok:

        print(
            "YOUTUBE VIDEO ERROR:",
            response.text
        )

        raise RuntimeError(
            "YouTube video details request failed"
        )


    return response.json().get(
        "items",
        []
    )


# ============================================================
# PREPARE VIDEO
# ============================================================

def prepare_video(
    video,
    skill
):

    snippet = video.get(
        "snippet",
        {}
    )

    statistics = video.get(
        "statistics",
        {}
    )

    content_details = video.get(
        "contentDetails",
        {}
    )

    video_id = video.get(
        "id"
    )

    title = snippet.get(
        "title",
        "Untitled"
    )

    description = snippet.get(
        "description",
        ""
    )

    views = int(
        statistics.get(
            "viewCount",
            0
        )
    )

    likes = int(
        statistics.get(
            "likeCount",
            0
        )
    )

    published_at = snippet.get(
        "publishedAt",
        ""
    )


    relevance = (
        calculate_relevance_score(
            title,
            description,
            skill
        )
    )


    engagement = (
        calculate_engagement_score(
            views,
            likes
        )
    )


    popularity = (
        calculate_popularity_score(
            views,
            likes,
            relevance
        )
    )


    underrated = (
        calculate_underrated_score(
            views,
            likes,
            relevance
        )
    )


    recency = (
        calculate_recency_score(
            published_at
        )
    )


    return {

        "video_id":
            video_id,

        "title":
            title,

        "channel":
            snippet.get(
                "channelTitle",
                "Unknown channel"
            ),

        "thumbnail":
            snippet.get(
                "thumbnails",
                {}
            ).get(
                "high",
                snippet.get(
                    "thumbnails",
                    {}
                ).get(
                    "default",
                    {}
                )
            ).get(
                "url",
                ""
            ),

        "published_at":
            published_at,

        "views":
            views,

        "likes":
            likes,

        "duration":
            format_duration(
                content_details.get(
                    "duration"
                )
            ),

        "url":
            (
                "https://www.youtube.com/watch?v="
                f"{video_id}"
            ),

        "relevance_score":
            relevance,

        "engagement_score":
            engagement,

        "popularity_score":
            popularity,

        "underrated_score":
            underrated,

        "recency_score":
            recency
    }


# ============================================================
# GENERATE RECOMMENDATIONS
# ============================================================

def generate_youtube_recommendations(
    skill
):

    normalized_skill = (
        normalize_skill(skill)
    )


    # --------------------------------------------------------
    # FIRST: CHECK CACHE
    # --------------------------------------------------------

    cached = (
        get_cached_recommendations(
            normalized_skill
        )
    )


    if cached:

        print(
            f"YOUTUBE CACHE HIT: "
            f"{normalized_skill}"
        )

        return cached


    print(
        f"YOUTUBE CACHE MISS: "
        f"{normalized_skill}"
    )


    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    search_data = (
        search_youtube_videos(
            normalized_skill
        )
    )


    search_items = (
        search_data.get(
            "items",
            []
        )
    )


    video_ids = []


    for item in search_items:

        video_id = (
            item.get(
                "id",
                {}
            ).get(
                "videoId"
            )
        )

        if video_id:

            video_ids.append(
                video_id
            )


    video_details = (
        get_video_details(
            video_ids
        )
    )


    prepared = []


    for video in video_details:

        result = prepare_video(
            video,
            normalized_skill
        )


        if result[
            "relevance_score"
        ] < 25:

            continue


        prepared.append(
            result
        )


    # --------------------------------------------------------
    # POPULAR
    # --------------------------------------------------------

    popular = sorted(

        prepared,

        key=lambda item:
            item[
                "popularity_score"
            ],

        reverse=True

    )[:5]


    # --------------------------------------------------------
    # HIDDEN GEMS
    # --------------------------------------------------------

    underrated = sorted(

        prepared,

        key=lambda item:
            item[
                "underrated_score"
            ],

        reverse=True

    )[:5]


    result = {

        "skill":
            normalized_skill,

        "popular":
            popular,

        "underrated":
            underrated,

        "source":
            "youtube"

    }


    # --------------------------------------------------------
    # SAVE TO CACHE
    # --------------------------------------------------------

    save_cached_recommendations(
        normalized_skill,
        result
    )


    return result


# ============================================================
# API ENDPOINT
# ============================================================

@youtube.route(
    "/recommendations",
    methods=["GET"]
)
def youtube_recommendations():

    skill = request.args.get(
        "skill",
        ""
    ).strip()


    if not skill:

        return jsonify({

            "status":
                "error",

            "message":
                "Skill parameter is required"

        }), 400


    try:

        recommendations = (
            generate_youtube_recommendations(
                skill
            )
        )


        return jsonify({

            "status":
                "success",

            "message":
                (
                    "YouTube recommendations "
                    "generated successfully"
                ),

            "data":
                recommendations

        }), 200


    except RuntimeError as error:

        message = str(error)


        # ----------------------------------------------------
        # QUOTA ERROR
        # ----------------------------------------------------

        if "quota" in message.lower():

            return jsonify({

                "status":
                    "quota_exceeded",

                "message":
                    message,

                "data": {
                    "skill":
                        normalize_skill(
                            skill
                        ),

                    "popular":
                        [],

                    "underrated":
                        [],

                    "source":
                        "youtube_quota_exceeded"
                }

            }), 200


        return jsonify({

            "status":
                "error",

            "message":
                message

        }), 500


    except Exception as error:

        print(
            "YOUTUBE API ERROR:",
            error
        )


        return jsonify({

            "status":
                "error",

            "message":
                (
                    "Could not generate "
                    "YouTube recommendations"
                )

        }), 500