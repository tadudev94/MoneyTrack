1. Chuẩn bị tài khoản và công cụ

Google Play Developer Account:

Truy cập Google Play Console để đăng ký tài khoản.

Phí đăng ký: $25 (một lần).

Chuẩn bị tài khoản Gmail để liên kết.

Chuẩn bị ứng dụng:

Ứng dụng phải được build dưới dạng APK hoặc AAB (Android App Bundle).

Google khuyến nghị dùng AAB, vì hỗ trợ cài đặt tối ưu cho nhiều thiết bị.

2. Chuẩn bị thông tin app

Bạn cần chuẩn bị các thông tin để tạo listing trên Play Store:

Tên app

Mô tả ngắn và dài

Icon app (512x512 px, định dạng PNG)

Screenshots (ít nhất 2-8 tấm, định dạng JPG hoặc PNG, kích thước tuỳ thiết bị: điện thoại, tablet…)

Feature Graphic (1024x500 px) để hiển thị trên Play Store

Category (Game/App, subcategory)

Contact details (email bắt buộc, website và số điện thoại tuỳ chọn)

Privacy Policy URL nếu app dùng dữ liệu người dùng

3. Upload app lên Google Play Console

Đăng nhập Google Play Console.

Chọn “Create app” → điền thông tin cơ bản (tên, ngôn ngữ, loại app…).

Điền App Content (nội dung app, rating, privacy…).

Upload bản build:

Chọn Production → Create Release

Upload file AAB hoặc APK

Điền thông tin release: version, notes.

4. Cấu hình pricing & distribution

Chọn app miễn phí hay trả phí.

Chọn quốc gia phát hành.

Đồng ý với Developer Program Policies và Content Guidelines.

5. Kiểm tra & submit

Google sẽ kiểm tra app tự động.

Nếu app hợp lệ, nhấn “Review and publish”.

Quá trình review thường mất 1–7 ngày.

💡 Tips:

Test app thật kỹ trước khi submit.

Đặt version code & version name đúng chuẩn (ví dụ versionCode tăng dần cho mỗi release).

Chuẩn bị privacy policy và screenshots đẹp để tăng tỉ lệ cài đặt.

#
npx react-native run-android

##
 adb install -r app/build/outputs/apk/debug/app-debug.apk
#
 cd android
./gradlew assembleRelease

