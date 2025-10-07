from fastapi import APIRouter, HTTPException
import httpx
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()

class GitHubRepo(BaseModel):
    name: str
    description: Optional[str]
    html_url: str
    stargazers_count: int
    forks_count: int
    language: Optional[str]
    updated_at: str

class GitHubProfile(BaseModel):
    login: str
    name: Optional[str]
    avatar_url: str
    bio: Optional[str]
    company: Optional[str]
    location: Optional[str]
    blog: Optional[str]
    twitter_username: Optional[str]
    public_repos: int
    followers: int
    following: int
    created_at: str
    html_url: str
    repos: List[GitHubRepo] = []

@router.get("/github/profile/{username}")
async def get_github_profile(username: str):
    """Fetch GitHub profile data for a user"""
    try:
        async with httpx.AsyncClient() as client:
            # Fetch user profile
            profile_response = await client.get(
                f"https://api.github.com/users/{username}",
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=10.0
            )
            
            if profile_response.status_code != 200:
                raise HTTPException(status_code=404, detail="GitHub user not found")
            
            profile_data = profile_response.json()
            
            # Fetch user's repositories (top 6 by stars)
            repos_response = await client.get(
                f"https://api.github.com/users/{username}/repos?sort=updated&per_page=6",
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=10.0
            )
            
            repos_data = []
            if repos_response.status_code == 200:
                repos_data = repos_response.json()
            
            # Format repositories
            repos = [
                GitHubRepo(
                    name=repo["name"],
                    description=repo.get("description"),
                    html_url=repo["html_url"],
                    stargazers_count=repo["stargazers_count"],
                    forks_count=repo["forks_count"],
                    language=repo.get("language"),
                    updated_at=repo["updated_at"]
                )
                for repo in repos_data
            ]
            
            # Create profile response
            profile = GitHubProfile(
                login=profile_data["login"],
                name=profile_data.get("name"),
                avatar_url=profile_data["avatar_url"],
                bio=profile_data.get("bio"),
                company=profile_data.get("company"),
                location=profile_data.get("location"),
                blog=profile_data.get("blog"),
                twitter_username=profile_data.get("twitter_username"),
                public_repos=profile_data["public_repos"],
                followers=profile_data["followers"],
                following=profile_data["following"],
                created_at=profile_data["created_at"],
                html_url=profile_data["html_url"],
                repos=repos
            )
            
            return profile
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching GitHub data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
