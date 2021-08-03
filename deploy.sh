git reset --hard
git pull

cd backend

npm run build-dev
cd ..

yarn build
pm2 restart sl
