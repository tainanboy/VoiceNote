# for localhost deployment

docker build -t node-web-app .

docker run -p 3000 node-web-app

# look at whcich port in use
#docker ps

# login to bash to container
#docker exec -it containerID /bin/bash