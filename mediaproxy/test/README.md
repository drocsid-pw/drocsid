How to test:
- Run both cdn and mediaproxy dockerfiles, assuming there is an internal network 
- If there is no internal network just run the cdn as a docker and mediaproxy locally ('go run .')
- Run 'python createSAS.py' to create a sas key
- Run 'python testUploadImage.py' and 'python testUploadVideo.py' and check the links in your browser