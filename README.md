# This is the repository for a local website for seamless translation from one to another language.

# Installation
1. clone the rep
2. install nodejs
  sudo apt install nodejs
  sudo apt install npm
3. install vite locally
  npm install vite --save-dev
4. Using terminal go to your repository.
5. initialize the dev project
  npm i
6. run the dev project
  npm run dev
7. IT IS NOT YET READY FOR PUBLISHING :D

## Prerequisite docker installation
1. curl -sSL https://get.docker.com | sh
2. sudo usermod -aG docker $USER
3. sudo ./run.sh --host 0.0.0.0 --port 5000 --load-only fa,en

## Prerequisite install libretranslate 
1. Activate local environment 
2. Libretranslate --host 0.0.0.0 --port 5000 #--cors-origins "*"


## Debugging: 
make sure vit is installed.
otherwise, uninstall vit. npm uninstall vit
npm run build

if Vite is installed locally (in your environment):
    npx vite preview
if Vite is installed globally (on your system):
    vite preview

##########
MIT License

Copyright (c) 2025 Mehdi Ramezani

Permission is hereby granted, free of charge, to any person obtaining a copy.
