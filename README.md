# fragments

API server setup for cloud computing

Scripts:
npm run lint:
checks code for errors, bad pratice, etc.

npm run start:
runs server using node, but wont restarted on file change

npm run dev:
uses nodemon to allow for server restart on file changes

npm run debug:
enables VSCode debugger on port 9229 (test routes etc.)

docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 -d fragments:latest
run the docker container using jest env variables

docker run --rm --name fragments --env-file .env -p 8080:8080 -d fragments:latest
run the docker container using .env variables

docker stop fragments
docker stop pid or name will end the process

docker ps
shows docker processes currently runnning

docker build -t marcusb71/fragments:lab-6 .
builds my docker image. Only need to do this locally, then can just pull and run on EC2.

docker push --all-tags marcusb71/fragments
pushes all docker tagged images to docker hub

docker pull marcusb71/fragments:lab-6
pulls my docker image from docker hub
