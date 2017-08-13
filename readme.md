# stream-cortex

live video streaming experiments with node.

## overview

This project is a experimental test suite trialing a variety of live video streaming approaches using ffmpeg and node.

## prereq

This project was developed on linux mint 18.1 (ubuntu). The project takes a reference on the node module ```node-canvas``` which in turn requires the cairo imaging library. The following should be installed prior to running.

### cairo 
```
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
```
### ffmpeg
```
sudo apt-get install ffmpeg  
```
or if not found, the PPA's are: 
```
sudo add-apt-repository ppa:mc3man/trusty-media
sudo apt-get update
sudo apt-get install ffmpeg
```
## running the project

The following will start a video server demo on ```http://localhost:5000```
```
npm start
```