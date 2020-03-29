cd ./src
npm run build
cd ..
docker build . -t covidstategraph:latest