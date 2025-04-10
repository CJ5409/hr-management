import sys

def parse_cv(file_path):
    # Mock CV parsing logic (replace with actual PDF parsing if needed)
    return f"Parsed CV from {file_path}: Name: John Doe, Experience: 5 years"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python parse_cv.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    result = parse_cv(file_path)
    print(result)