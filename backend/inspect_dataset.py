import pandas as pd
from pathlib import Path


RAW_DIR = Path("data/raw")

files = [
    "job_description.csv",
    "job_posting.csv"
]


for filename in files:
    file_path = RAW_DIR / filename

    print("\n" + "=" * 80)
    print(f"FILE: {filename}")
    print("=" * 80)

    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        continue

    try:
        df = pd.read_csv(file_path)

        print(f"\nRows: {len(df):,}")
        print(f"Columns: {len(df.columns)}")

        print("\nColumn names:")
        for column in df.columns:
            print(f"  - {column}")

        print("\nMissing values:")
        missing = df.isnull().sum()

        for column, count in missing.items():
            if count > 0:
                percentage = (count / len(df)) * 100
                print(f"  - {column}: {count:,} ({percentage:.2f}%)")

        print("\nFirst 3 rows:")
        print(df.head(3).to_string())

    except Exception as e:
        print(f"❌ Error reading {filename}:")
        print(e)