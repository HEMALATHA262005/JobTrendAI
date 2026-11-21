from flask import Blueprint, jsonify, request

learning = Blueprint("learning", __name__)


# ---------------------------------------------------------
# FALLBACK LEARNING RESOURCES
# ---------------------------------------------------------
# These resources are used when live YouTube recommendations
# are unavailable because of API quota/network limitations.
# ---------------------------------------------------------

FALLBACK_RESOURCES = {
    "Python": [
        {
            "title": "Python Official Documentation",
            "type": "Official Documentation",
            "platform": "Python",
            "description": "Official Python documentation for learning the language, syntax, libraries, and reference material.",
            "url": "https://docs.python.org/3/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "Python Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Beginner-friendly Python tutorials with examples and exercises.",
            "url": "https://www.w3schools.com/python/",
            "level": "Beginner",
        },
    ],

    "Java": [
        {
            "title": "Java Documentation",
            "type": "Official Documentation",
            "platform": "Oracle",
            "description": "Official Java documentation, tutorials, APIs, and developer resources.",
            "url": "https://docs.oracle.com/en/java/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "Java Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Learn Java fundamentals through examples and practical exercises.",
            "url": "https://www.w3schools.com/java/",
            "level": "Beginner",
        },
    ],

    "JavaScript": [
        {
            "title": "JavaScript Guide",
            "type": "Official Guide",
            "platform": "MDN",
            "description": "Comprehensive JavaScript guide covering fundamentals through advanced concepts.",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "level": "Beginner → Advanced",
        },
        {
            "title": "JavaScript Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Interactive JavaScript tutorials with examples and exercises.",
            "url": "https://www.w3schools.com/js/",
            "level": "Beginner",
        },
    ],

    "TypeScript": [
        {
            "title": "TypeScript Documentation",
            "type": "Official Documentation",
            "platform": "TypeScript",
            "description": "Official TypeScript handbook and language documentation.",
            "url": "https://www.typescriptlang.org/docs/",
            "level": "Beginner → Advanced",
        },
    ],

    "React": [
        {
            "title": "React Documentation",
            "type": "Official Documentation",
            "platform": "React",
            "description": "Official React documentation covering components, hooks, state, and modern React development.",
            "url": "https://react.dev/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "React Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Beginner-friendly React tutorials and examples.",
            "url": "https://www.w3schools.com/react/",
            "level": "Beginner",
        },
    ],

    "HTML": [
        {
            "title": "HTML Learning Area",
            "type": "Learning Guide",
            "platform": "MDN",
            "description": "Structured HTML learning resources from fundamentals to modern web development.",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
            "level": "Beginner",
        },
        {
            "title": "HTML Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Interactive HTML tutorials and examples.",
            "url": "https://www.w3schools.com/html/",
            "level": "Beginner",
        },
    ],

    "CSS": [
        {
            "title": "CSS Learning Area",
            "type": "Learning Guide",
            "platform": "MDN",
            "description": "Learn CSS layout, styling, responsive design, and modern CSS techniques.",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics",
            "level": "Beginner → Advanced",
        },
        {
            "title": "CSS Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Interactive CSS tutorials with practical examples.",
            "url": "https://www.w3schools.com/css/",
            "level": "Beginner",
        },
    ],

    "SQL": [
        {
            "title": "SQL Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Learn SQL queries, filtering, joins, aggregation, and database operations.",
            "url": "https://www.w3schools.com/sql/",
            "level": "Beginner → Intermediate",
        },
        {
            "title": "PostgreSQL Tutorial",
            "type": "Documentation",
            "platform": "PostgreSQL",
            "description": "Official PostgreSQL documentation and SQL learning resources.",
            "url": "https://www.postgresql.org/docs/",
            "level": "Intermediate → Advanced",
        },
    ],

    "Data Analysis": [
        {
            "title": "Pandas User Guide",
            "type": "Official Documentation",
            "platform": "Pandas",
            "description": "Learn data manipulation and analysis using Pandas.",
            "url": "https://pandas.pydata.org/docs/user_guide/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "Kaggle Learn",
            "type": "Practice Course",
            "platform": "Kaggle",
            "description": "Short practical courses for Python, Pandas, data visualization, and machine learning.",
            "url": "https://www.kaggle.com/learn",
            "level": "Beginner → Intermediate",
        },
    ],

    "Pandas": [
        {
            "title": "Pandas Documentation",
            "type": "Official Documentation",
            "platform": "Pandas",
            "description": "Official Pandas documentation and user guides.",
            "url": "https://pandas.pydata.org/docs/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "Pandas Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Learn Pandas data manipulation with practical examples.",
            "url": "https://www.w3schools.com/python/pandas/",
            "level": "Beginner",
        },
    ],

    "NumPy": [
        {
            "title": "NumPy Documentation",
            "type": "Official Documentation",
            "platform": "NumPy",
            "description": "Official NumPy documentation for numerical computing with Python.",
            "url": "https://numpy.org/doc/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "NumPy Tutorial",
            "type": "Tutorial",
            "platform": "W3Schools",
            "description": "Beginner-friendly NumPy tutorials and examples.",
            "url": "https://www.w3schools.com/python/numpy/",
            "level": "Beginner",
        },
    ],

    "Machine Learning": [
        {
            "title": "Machine Learning Crash Course",
            "type": "Free Course",
            "platform": "Google",
            "description": "Practical introduction to machine learning concepts, models, and exercises.",
            "url": "https://developers.google.com/machine-learning/crash-course",
            "level": "Beginner → Intermediate",
        },
        {
            "title": "Machine Learning",
            "type": "Learning Course",
            "platform": "Kaggle",
            "description": "Practical machine learning lessons with hands-on exercises.",
            "url": "https://www.kaggle.com/learn/intro-to-machine-learning",
            "level": "Beginner",
        },
    ],

    "Deep Learning": [
        {
            "title": "Deep Learning Specialization",
            "type": "Course",
            "platform": "DeepLearning.AI",
            "description": "Structured learning path covering neural networks and deep learning.",
            "url": "https://www.deeplearning.ai/courses/deep-learning-specialization/",
            "level": "Intermediate",
        },
        {
            "title": "PyTorch Tutorials",
            "type": "Official Tutorials",
            "platform": "PyTorch",
            "description": "Hands-on tutorials for building and training deep learning models.",
            "url": "https://docs.pytorch.org/tutorials/",
            "level": "Intermediate → Advanced",
        },
    ],

    "AI": [
        {
            "title": "AI Courses",
            "type": "Learning Path",
            "platform": "Google",
            "description": "AI learning resources covering machine learning and modern AI concepts.",
            "url": "https://ai.google/education/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "Kaggle Learn",
            "type": "Practical Learning",
            "platform": "Kaggle",
            "description": "Hands-on courses covering machine learning and AI-related topics.",
            "url": "https://www.kaggle.com/learn",
            "level": "Beginner → Intermediate",
        },
    ],

    "Generative AI": [
        {
            "title": "Generative AI Learning Path",
            "type": "Learning Path",
            "platform": "Google Cloud",
            "description": "Learning resources covering generative AI fundamentals and applications.",
            "url": "https://www.cloudskillsboost.google/paths/118",
            "level": "Beginner → Intermediate",
        },
        {
            "title": "Generative AI Courses",
            "type": "Courses",
            "platform": "DeepLearning.AI",
            "description": "Practical courses covering modern generative AI concepts and applications.",
            "url": "https://www.deeplearning.ai/courses/",
            "level": "Beginner → Advanced",
        },
    ],

    "NLP": [
        {
            "title": "NLP Course",
            "type": "Free Course",
            "platform": "Hugging Face",
            "description": "Hands-on natural language processing course using modern NLP tools and transformers.",
            "url": "https://huggingface.co/learn/nlp-course/",
            "level": "Intermediate",
        },
        {
            "title": "Natural Language Processing",
            "type": "Course",
            "platform": "DeepLearning.AI",
            "description": "Structured NLP learning resources covering practical language-processing concepts.",
            "url": "https://www.deeplearning.ai/courses/",
            "level": "Intermediate",
        },
    ],

    "LLMs": [
        {
            "title": "LLM Course",
            "type": "Free Course",
            "platform": "Hugging Face",
            "description": "Learn about large language models, transformers, fine-tuning, and applications.",
            "url": "https://huggingface.co/learn/llm-course/",
            "level": "Intermediate → Advanced",
        },
        {
            "title": "Generative AI Courses",
            "type": "Courses",
            "platform": "DeepLearning.AI",
            "description": "Practical courses focused on large language models and generative AI.",
            "url": "https://www.deeplearning.ai/courses/",
            "level": "Beginner → Advanced",
        },
    ],

    "TensorFlow": [
        {
            "title": "TensorFlow Tutorials",
            "type": "Official Tutorials",
            "platform": "TensorFlow",
            "description": "Official TensorFlow tutorials for machine learning and deep learning.",
            "url": "https://www.tensorflow.org/tutorials",
            "level": "Beginner → Advanced",
        },
    ],

    "PyTorch": [
        {
            "title": "PyTorch Tutorials",
            "type": "Official Tutorials",
            "platform": "PyTorch",
            "description": "Official tutorials for tensors, neural networks, training, and deployment.",
            "url": "https://docs.pytorch.org/tutorials/",
            "level": "Beginner → Advanced",
        },
    ],

    "Scikit-learn": [
        {
            "title": "Scikit-learn User Guide",
            "type": "Official Documentation",
            "platform": "Scikit-learn",
            "description": "Official documentation covering machine learning algorithms and workflows.",
            "url": "https://scikit-learn.org/stable/user_guide.html",
            "level": "Beginner → Advanced",
        },
    ],

    "LangChain": [
        {
            "title": "LangChain Documentation",
            "type": "Official Documentation",
            "platform": "LangChain",
            "description": "Official documentation for building applications with language models.",
            "url": "https://docs.langchain.com/",
            "level": "Intermediate → Advanced",
        },
    ],

    "MLOps": [
        {
            "title": "MLOps Learning Path",
            "type": "Learning Path",
            "platform": "Google Cloud",
            "description": "Resources covering machine learning operations, deployment, and production workflows.",
            "url": "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning",
            "level": "Intermediate → Advanced",
        },
        {
            "title": "Made With ML",
            "type": "Practical Course",
            "platform": "Made With ML",
            "description": "Practical resources for building, deploying, and maintaining machine learning systems.",
            "url": "https://madewithml.com/",
            "level": "Intermediate → Advanced",
        },
    ],

    "AWS": [
        {
            "title": "AWS Skill Builder",
            "type": "Learning Platform",
            "platform": "AWS",
            "description": "Official AWS training and learning resources.",
            "url": "https://skillbuilder.aws/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "AWS Documentation",
            "type": "Official Documentation",
            "platform": "AWS",
            "description": "Official AWS documentation for cloud services and architecture.",
            "url": "https://docs.aws.amazon.com/",
            "level": "Beginner → Advanced",
        },
    ],

    "Azure": [
        {
            "title": "Microsoft Learn",
            "type": "Learning Platform",
            "platform": "Microsoft",
            "description": "Official Azure learning paths and hands-on modules.",
            "url": "https://learn.microsoft.com/training/azure/",
            "level": "Beginner → Advanced",
        },
    ],

    "Google Cloud": [
        {
            "title": "Google Cloud Training",
            "type": "Learning Platform",
            "platform": "Google Cloud",
            "description": "Official Google Cloud training and learning resources.",
            "url": "https://cloud.google.com/learn/training",
            "level": "Beginner → Advanced",
        },
    ],

    "Docker": [
        {
            "title": "Docker Get Started",
            "type": "Official Tutorial",
            "platform": "Docker",
            "description": "Official Docker learning resources covering containers and workflows.",
            "url": "https://docs.docker.com/get-started/",
            "level": "Beginner → Intermediate",
        },
    ],

    "Kubernetes": [
        {
            "title": "Kubernetes Basics",
            "type": "Interactive Tutorial",
            "platform": "Kubernetes",
            "description": "Interactive introduction to deploying and managing applications with Kubernetes.",
            "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
            "level": "Beginner → Intermediate",
        },
    ],

    "Git": [
        {
            "title": "Git Documentation",
            "type": "Official Documentation",
            "platform": "Git",
            "description": "Official Git reference and documentation.",
            "url": "https://git-scm.com/doc",
            "level": "Beginner → Advanced",
        },
        {
            "title": "GitHub Skills",
            "type": "Interactive Courses",
            "platform": "GitHub",
            "description": "Interactive exercises for learning GitHub workflows and development practices.",
            "url": "https://skills.github.com/",
            "level": "Beginner → Intermediate",
        },
    ],

    "MongoDB": [
        {
            "title": "MongoDB University",
            "type": "Free Courses",
            "platform": "MongoDB",
            "description": "Official MongoDB courses and developer learning resources.",
            "url": "https://learn.mongodb.com/",
            "level": "Beginner → Advanced",
        },
        {
            "title": "MongoDB Documentation",
            "type": "Official Documentation",
            "platform": "MongoDB",
            "description": "Official MongoDB documentation and developer guides.",
            "url": "https://www.mongodb.com/docs/",
            "level": "Beginner → Advanced",
        },
    ],

    "Cybersecurity": [
        {
            "title": "Cybersecurity Learning",
            "type": "Learning Resources",
            "platform": "Cisco",
            "description": "Cybersecurity learning resources and introductory material.",
            "url": "https://www.cisco.com/site/us/en/learn/topics/security/index.html",
            "level": "Beginner → Intermediate",
        },
        {
            "title": "Cybersecurity Training",
            "type": "Learning Platform",
            "platform": "TryHackMe",
            "description": "Hands-on cybersecurity learning through practical labs.",
            "url": "https://tryhackme.com/",
            "level": "Beginner → Advanced",
        },
    ],
}


# ---------------------------------------------------------
# NORMALIZATION
# ---------------------------------------------------------

ALIASES = {
    "artificial intelligence": "AI",
    "ai": "AI",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "natural language processing": "NLP",
    "nlp": "NLP",
    "large language models": "LLMs",
    "large language model": "LLMs",
    "llm": "LLMs",
    "llms": "LLMs",
    "scikit learn": "Scikit-learn",
    "scikit-learn": "Scikit-learn",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "google cloud": "Google Cloud",
    "gcp": "Google Cloud",
}


def normalize_skill(skill):
    cleaned = str(skill or "").strip()

    if not cleaned:
        return ""

    alias_key = cleaned.lower()

    if alias_key in ALIASES:
        return ALIASES[alias_key]

    for known_skill in FALLBACK_RESOURCES:
        if known_skill.lower() == alias_key:
            return known_skill

    return cleaned


# ---------------------------------------------------------
# GET RESOURCES FOR A SKILL
# ---------------------------------------------------------

@learning.route("/resources", methods=["GET"])
def get_resources():
    skill = normalize_skill(request.args.get("skill", ""))

    if not skill:
        return jsonify({
            "status": "error",
            "message": "Skill is required."
        }), 400

    resources = FALLBACK_RESOURCES.get(skill, [])

    return jsonify({
        "status": "success",
        "skill": skill,
        "resources": resources,
        "count": len(resources)
    })


# ---------------------------------------------------------
# GET RECOMMENDATIONS FOR MULTIPLE SKILLS
# ---------------------------------------------------------

@learning.route("/recommendations", methods=["GET"])
def get_recommendations():
    skills_param = request.args.get("skills", "")

    if not skills_param:
        return jsonify({
            "status": "error",
            "message": "Skills are required."
        }), 400

    skills = [
        normalize_skill(skill)
        for skill in skills_param.split(",")
        if skill.strip()
    ]

    recommendations = {}

    for skill in skills:
        resources = FALLBACK_RESOURCES.get(skill, [])

        if resources:
            recommendations[skill] = resources

    return jsonify({
        "status": "success",
        "recommendations": recommendations,
        "count": len(recommendations)
    })