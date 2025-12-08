10062025
# build 
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
Save at android/app/my-release-key.keystore

keytool -genkeypair -v -keystore debug.keystore -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000

# 
npm install
# 
npm install react-native-worklets
#

cd android
./gradlew assembleRelease
adb install -r app\build\outputs\apk\release\app-release.apk


# 
npm install react-native-worklets


#
npx react-native run-android

