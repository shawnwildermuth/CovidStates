cd ./src
npm run build
cd ..
docker build . -t covidstates:latest
docker tag covidstates:latest shawnwildermuth/covidstates:latest
docker push shawnwildermuth/covidstates:latest