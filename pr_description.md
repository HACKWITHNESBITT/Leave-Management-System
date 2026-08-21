Setup SQLite on Render: entrypoint, Dockerfile entrypoint, and frontend static service

This commit prepares the application to run on Render using SQLite for the backend database and builds the frontend as a static service.

Files changed:
- backend/docker-entrypoint.sh  (creates sqlite, sets permissions, runs composer/migrate)
- backend/Dockerfile  (copies entrypoint and sets ENTRYPOINT)
- render.yaml  (configures backend to use sqlite and adds static frontend service)
