import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "finsight-dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/finsight"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False