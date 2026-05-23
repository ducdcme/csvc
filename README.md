# CSVC Management System  

---

# 1. Project Overview

## 1.1. Project Name
**CSVC Management System**

## 1.2. Project Purpose
CSVC Management System là hệ thống web nội bộ dùng để quản lý hoạt động vận hành cơ sở vật chất trong trường học.

Hệ thống tập trung vào các nhóm nghiệp vụ chính:

- Quản lý báo hỏng và sửa chữa cơ sở vật chất
- Quản lý vận hành kỹ thuật hằng ngày
- Quản lý công việc định kỳ
- Quản lý công việc phát sinh
- Tổng hợp báo cáo vận hành cho quản lý

## 1.3. Business Objectives
Hệ thống được xây dựng nhằm giải quyết các vấn đề hiện tại khi quản lý bằng Excel và sổ ghi chép, bao gồm:

- Khó theo dõi tiến độ sửa chữa
- Khó kiểm soát tình trạng cơ sở vật chất
- Khó quản lý công việc vận hành kỹ thuật
- Khó tổng hợp báo cáo tháng và năm học
- Dữ liệu phân tán, khó tra cứu và khó thống kê

## 1.4. Operational Scope
Hệ thống phục vụ công tác vận hành cơ sở vật chất cho trường học, bao gồm:

- Cơ sở vật chất trong phòng học và phòng chức năng
- Hệ thống kỹ thuật vận hành toàn trường
- Công tác kiểm tra rủi ro hằng ngày
- Công tác bảo trì định kỳ
- Công việc kỹ thuật phát sinh
- Báo cáo vận hành cho giám sát và Ban giám hiệu

## 1.5. Scope of Managed Assets
Hệ thống quản lý nhiều loại cơ sở vật chất và thiết bị, ví dụ:

- Bàn
- Ghế
- Bảng
- Tủ đồ
- Cửa kính
- Cửa gỗ
- Rèm cửa
- Công tắc
- Ổ cắm
- Máy chiếu
- Điều hòa

Danh mục CSVC được tổ chức theo **loại phòng**, để đảm bảo mỗi phòng chỉ hiển thị đúng các loại CSVC phù hợp khi báo hỏng và quản lý.

## 1.6. Deployment Context
Hệ thống được triển khai cho **2 cơ sở** của trường, sử dụng:

- **1 database chung**
- Dữ liệu được phân tách theo **cơ sở**
- Người dùng chọn **cơ sở** khi vào hệ thống
- Riêng khái niệm **khu vận hành** chỉ áp dụng trong một số module vận hành, không thuộc location tree chính

---

# 2. User Roles and Access Scope

## 2.1. User Groups
Hệ thống có 4 nhóm người dùng chính:

1. Guest Users  
2. Technical Staff  
3. Technical Supervisor  
4. System Admin  

## 2.2. Guest Users
Đối tượng:

- Cán bộ
- Giáo viên
- Nhân viên

Đặc điểm:

- Không cần tài khoản
- Không cần đăng nhập

Phạm vi sử dụng:

- Truy cập website báo hỏng
- Xem bảng kết quả / trạng thái sửa chữa công khai
- Chọn cơ sở, phòng, loại CSVC / thiết bị
- Nhập mô tả lỗi
- Đính kèm ảnh nếu cần
- Gửi phiếu báo hỏng

Quy ước dữ liệu:

- Nhóm guest được quy ước đơn giản là: **Giáo viên**
- Hệ thống không yêu cầu lưu danh tính riêng của guest

## 2.3. Technical Staff
Đối tượng:

- Đội kỹ thuật

Đặc điểm:

- Bắt buộc đăng nhập
- Thao tác trên các module kỹ thuật

Phạm vi sử dụng:

- Xem danh sách phiếu báo hỏng chờ tiếp nhận
- Tự nhận phiếu sửa chữa
- Cập nhật trạng thái sửa chữa
- Thực hiện và nộp biên bản kiểm tra rủi ro hằng ngày
- Xử lý các công việc định kỳ
- Cập nhật kết quả công việc phát sinh
- Xem các cảnh báo đến hạn / quá hạn liên quan tới công việc kỹ thuật
- Xem báo cáo và thống kê trong phạm vi được cấp quyền

## 2.4. Technical Supervisor
Đối tượng:

- Giám sát kỹ thuật

Đặc điểm:

- Bắt buộc đăng nhập
- Thuộc nhóm quản lý vận hành kỹ thuật

Phạm vi sử dụng:

- Theo dõi hoạt động của đội kỹ thuật
- Tạo và quản lý công việc phát sinh
- Theo dõi sửa chữa, kiểm tra, công việc định kỳ
- Tổng hợp báo cáo vận hành
- Lập và chốt báo cáo gửi Ban giám hiệu
- Quản lý lịch trực kỹ thuật / bảo vệ
- Truy cập trang quản trị trong phạm vi quyền được cấp

Giới hạn:

- Không mặc định có toàn quyền hệ thống như admin
- Quyền thao tác phụ thuộc cấu hình role + permission

## 2.5. System Admin
Đối tượng:

- Quản trị hệ thống

Đặc điểm:

- Bắt buộc đăng nhập
- Có quyền quản trị toàn hệ thống

Phạm vi sử dụng:

- Toàn bộ chức năng của giám sát kỹ thuật
- Quản lý người dùng
- Quản lý role
- Quản lý permission
- Quản lý danh mục nền
- Quản lý cấu hình hệ thống
- Truy cập và vận hành toàn bộ dữ liệu hệ thống

## 2.6. Access Model
Hệ thống áp dụng mô hình phân quyền:

**Role + Permission**

Ý nghĩa:

- Quyền truy cập không chỉ phụ thuộc tên vai trò
- Mỗi role có thể được gán nhiều permission
- Hệ thống có thể mở rộng thêm vai trò mới trong tương lai mà không cần thay đổi kiến trúc nền

## 2.7. Campus Access Context
Do hệ thống triển khai cho 2 cơ sở và dùng 1 database chung:

- Người dùng sẽ chọn **cơ sở làm việc** khi vào hệ thống
- Dữ liệu hiển thị và thao tác sẽ theo **context cơ sở đã chọn**
- Một số user có thể được cấp quyền trên:
  - Một cơ sở
  - Nhiều cơ sở
  - Toàn bộ hệ thống

---

# 3. System Scope and Master Data Structure

## 3.1. System Scope
Hệ thống bao phủ các nhóm chức năng chính sau:

- Danh mục nền và cấu trúc location
- Báo hỏng và sửa chữa cơ sở vật chất
- Vận hành kỹ thuật hằng ngày
- Công việc định kỳ
- Công việc phát sinh
- Báo cáo vận hành
- Lịch trực đơn giản
- Quản trị người dùng và phân quyền

## 3.2. Core Location Structure
Cấu trúc location nền của hệ thống gồm:

**Cơ sở → Tòa → Tầng → Phòng**

tên phòng sử dụng thực tế có thể được xử lý linh hoạt ở app layer theo năm học

Ngoài ra có:

**Loại phòng**

Ý nghĩa:

- Mỗi phòng thuộc một tầng
- Mỗi tầng thuộc một tòa
- Mỗi tòa thuộc một cơ sở
- Mỗi phòng có một loại phòng

## 3.3. Operation Zone Scope
Khái niệm **khu vận hành** không thuộc location tree chính.

Nó chỉ áp dụng cho một số module vận hành, đặc biệt là:

- Kiểm tra rủi ro hằng ngày
- Báo cáo vận hành liên quan theo khu

Quy tắc:

- Nếu cơ sở chỉ có 1 khu → mặc định khu = 1
- Nếu cơ sở có từ 2 khu trở lên → người dùng cần chọn khu khi thao tác trong module liên quan

## 3.4. Asset Master Data
Hệ thống cần có danh mục loại CSVC / thiết bị dùng chung.

Ví dụ:

- Bàn
- Ghế
- Bảng
- Tủ đồ
- Cửa kính
- Cửa gỗ
- Rèm cửa
- Công tắc
- Ổ cắm
- Máy chiếu
- Điều hòa

Danh mục này được dùng cho:

- Form báo hỏng
- Cấu hình theo loại phòng
- Thống kê và báo cáo

## 3.5. Room Type Asset Mapping
Hệ thống cần quản lý quan hệ:

**Loại phòng → Danh sách loại CSVC / thiết bị phù hợp**

Ý nghĩa:

- Khi guest chọn phòng, hệ thống xác định loại phòng
- Chỉ hiển thị các loại CSVC phù hợp với loại phòng đó
- Hạn chế chọn sai thiết bị khi báo hỏng

## 3.6. Core Administrative Master Data
Ngoài location và asset type, hệ thống còn cần các danh mục nền sau:

- Cơ sở
- Loại phòng
- Loại CSVC / thiết bị
- Khu vận hành
- Loại công tác vận hành định kỳ
- Loại hạng mục bảo trì định kỳ
- Role
- Permission
- Cấu hình hệ thống

## 3.7. Data Architecture Direction
Hệ thống sử dụng:

**1 database chung**

và dữ liệu được phân tách theo:

**campus_id**

hoặc trường tương đương cho toàn bộ dữ liệu nghiệp vụ.

Điều này cho phép:

- Quản lý đồng thời nhiều cơ sở
- Dùng chung danh mục nền
- Tổng hợp báo cáo liên cơ sở
- Giữ codebase đơn giản hơn so với tách nhiều database

## 3.8. Incident Work Classification
Nội dung công việc phát sinh hiện tại được nhập tự do.

Tuy nhiên về mặt nghiệp vụ, công việc phát sinh chủ yếu thuộc 2 nhóm chính:

1. **Xây dựng và nội thất**  
2. **Cơ điện**

Ở phase đầu, hai nhóm này được đưa vào mô tả chính thức của hệ thống nhưng chưa bắt buộc tách thành master data riêng.

---

# 4. Core Workflows Summary

## 4.1. Repair Reporting and Fix Workflow
Hệ thống hỗ trợ quy trình báo hỏng và sửa chữa theo luồng:

**Guest báo hỏng → Chờ tiếp nhận → Đã tiếp nhận → Đang xử lý → Hoàn thành**

Mô tả chi tiết:

1. Guest gửi phiếu báo hỏng qua website  
2. Phiếu vào trạng thái **Chờ tiếp nhận**  
3. Đội kỹ thuật xem danh sách chờ  
4. Một kỹ thuật viên tự nhận phiếu  
5. Phiếu chuyển sang **Đã tiếp nhận**  
6. Tiến hành sửa chữa  
7. Phiếu chuyển sang **Đang xử lý**  
8. Khi sửa xong, phiếu chuyển sang **Hoàn thành** và tự đóng  

Trạng thái chính thức của phiếu:

- Chờ tiếp nhận
- Đã tiếp nhận
- Đang xử lý
- Hoàn thành

Đặc điểm:

- Guest không cần đăng nhập
- Guest không lưu danh tính riêng
- Ảnh đính kèm là optional
- Không lưu IP
- Guest portal hiển thị công khai bảng kết quả sửa chữa và form báo hỏng

## 4.2. Daily Risk Inspection Workflow
Hệ thống hỗ trợ biên bản kiểm tra rủi ro / vận hành hằng ngày theo:

**Cơ sở → Khu vận hành**

Quy tắc:

- Cơ sở có 1 khu thì mặc định khu = 1
- Cơ sở có từ 2 khu trở lên thì phải chọn khu

Mỗi ngày:

- Mỗi khu / cơ sở có 1 biên bản kiểm tra
- Biên bản gồm nhiều hạng mục kiểm tra theo nhóm hệ thống

Mỗi hạng mục có:

- Kết quả: `OK / Lỗi`
- Ảnh optional
- Ghi chú khi có lỗi

Đặc điểm:

- Kiểm tra thực hiện cuối ngày
- Chỉ lưu người thực hiện
- Không sinh tự động phiếu sửa chữa
- Quá giờ chưa nộp biên bản thì hệ thống cảnh báo

## 4.3. Periodic Work Workflow
Hệ thống có 1 module lớn:

**Công việc định kỳ**

gồm 2 nhánh:

### 4.3.1. Periodic Maintenance
Bảo trì định kỳ hệ thống / thiết bị.

Đặc điểm:

- Áp dụng theo loại hệ thống / thiết bị
- Có chu kỳ cấu hình trước
- Đến hạn hệ thống tự tạo job
- Cảnh báo tech và giám sát
- Trạng thái:
  - Đến hạn
  - Hoàn thành
- Quá hạn thì cảnh báo
- Hoàn thành xong tự sinh kỳ tiếp theo

Thông tin job gồm:

- Hạng mục bảo trì
- Ngày đến hạn
- Đơn vị thực hiện
- Kết quả
- Ảnh optional
- Ghi chú optional
- File biên bản bảo trì

### 4.3.2. Periodic Operation Tasks
Công tác vận hành định kỳ.

Đặc điểm:

- Áp dụng theo loại công tác
- Có chu kỳ
- Đến hạn tự sinh công việc
- Trạng thái:
  - Chưa thực hiện
  - Đã thực hiện
- Quá hạn thì cảnh báo
- Hoàn thành xong tự sinh kỳ tiếp theo
- Có thể có file báo cáo đính kèm

## 4.4. Incident Work Workflow
Hệ thống hỗ trợ quản lý công việc phát sinh ngoài luồng thường xuyên.

Phạm vi chính gồm 2 nhóm:

1. **Xây dựng và nội thất**
2. **Cơ điện**

Nguồn đề xuất có thể từ nhiều nguồn, nhưng người tạo chính thức trên hệ thống là:

- Giám sát kỹ thuật
- Admin

Thông tin công việc gồm:

- Nội dung công việc
- Đơn vị thực hiện
- Tiến độ
- Nghiệm thu
- Chi phí
- 1 file hồ sơ tổng

Trạng thái:

- Mới tạo
- Đang thực hiện
- Hoàn thành

## 4.5. Operation Report Workflow
Hệ thống hỗ trợ báo cáo vận hành theo:

- Tháng
- Năm học

Trong đó năm học tính theo:

**01/08 → 31/05**

Nguồn dữ liệu tổng hợp gồm:

- Sửa chữa báo hỏng
- Kiểm tra rủi ro hằng ngày
- Công việc định kỳ
- Công việc phát sinh

Không bao gồm:

- Lịch trực

Hình thức báo cáo:

- Xem trên web
- Xuất Excel
- Xuất PDF

Người lập / chốt báo cáo:

- Giám sát kỹ thuật
- Admin

Nội dung báo cáo gồm:

- Số liệu thống kê
- Kiến nghị
- Đề xuất

## 4.6. Duty Schedule Workflow
Hệ thống hỗ trợ lịch trực đơn giản cho:

- Kỹ thuật
- Bảo vệ

Ở giai đoạn hiện tại:

- Chưa cần workflow phức tạp
- Chưa cần thay ca / phân ca sâu
- Chỉ cần quản lý lịch trực cơ bản

---

# 5. Official System Module Definition

## 5.1. Master Data and Structure Modules

### 5.1.1. Campus Management
Quản lý danh mục cơ sở.

Chức năng:

- Tạo / sửa / khóa cơ sở
- Cấu hình cơ sở hoạt động trong hệ thống
- Làm context dữ liệu cho toàn bộ module khác

### 5.1.2. Location Management
Quản lý cấu trúc location nền của từng cơ sở:

**Tòa → Tầng → Phòng**

Chức năng:

- Quản lý tòa
- Quản lý tầng
- Quản lý phòng
- Liên kết phòng với cơ sở
- Liên kết phòng với loại phòng

### 5.1.3. Room Type Management
Quản lý danh mục loại phòng.

Ví dụ:

- Phòng học
- Văn phòng
- Phòng chức năng

Chức năng:

- Tạo / sửa danh mục loại phòng
- Dùng để mapping CSVC phù hợp theo loại phòng

### 5.1.4. Asset Type Management
Quản lý danh mục loại cơ sở vật chất / thiết bị.

Ví dụ:

- Bàn
- Ghế
- Bảng
- Công tắc
- Ổ cắm
- Máy chiếu
- Điều hòa

Chức năng:

- Tạo / sửa danh mục loại CSVC
- Dùng cho form báo hỏng
- Dùng cho thống kê / báo cáo

### 5.1.5. Room Type Asset Mapping
Quản lý quan hệ:

**Loại phòng → Danh sách loại CSVC phù hợp**

Chức năng:

- Cấu hình CSVC phù hợp theo từng loại phòng
- Kiểm soát danh sách CSVC hiển thị khi guest báo hỏng

### 5.1.6. Operation Zone Management
Quản lý khu vận hành dùng cho các module vận hành.

Đặc điểm:

- Không thuộc location tree chính
- Chỉ dùng cho các module vận hành như kiểm tra rủi ro và báo cáo vận hành theo khu

Chức năng:

- Cấu hình khu theo từng cơ sở
- Cho phép một cơ sở có 1 hoặc nhiều khu
- Nếu cơ sở chỉ có 1 khu thì hệ thống có thể mặc định khu đó

## 5.2. Repair Management Modules

### 5.2.1. Guest Repair Report
Cổng báo hỏng dành cho guest.

Chức năng:

- Hiển thị bảng kết quả sửa chữa công khai
- Hiển thị form báo hỏng
- Cho phép guest chọn cơ sở
- Chọn phòng
- Chọn loại CSVC / thiết bị phù hợp
- Nhập mô tả lỗi
- Đính kèm ảnh optional
- Gửi phiếu báo hỏng

### 5.2.2. Repair Intake Queue
Danh sách chờ tiếp nhận phiếu báo hỏng.

Chức năng:

- Hiển thị các phiếu ở trạng thái `Chờ tiếp nhận`
- Cho phép đội kỹ thuật xem danh sách phiếu mới
- Hỗ trợ kỹ thuật tự nhận việc

### 5.2.3. Repair Execution Management
Quản lý xử lý sửa chữa.

Chức năng:

- Kỹ thuật nhận phiếu
- Cập nhật trạng thái:
  - Chờ tiếp nhận
  - Đã tiếp nhận
  - Đang xử lý
  - Hoàn thành
- Cập nhật kết quả sửa chữa
- Đóng phiếu khi hoàn thành

## 5.3. Technical Operation Modules

### 5.3.1. Daily Risk Inspection
Quản lý biên bản kiểm tra rủi ro / vận hành hằng ngày.

Chức năng:

- Tạo biên bản kiểm tra theo cơ sở / khu
- Ghi nhận kết quả từng hạng mục `OK / Lỗi`
- Ghi chú lỗi
- Đính kèm ảnh optional
- Lưu người thực hiện
- Cảnh báo khi quá giờ chưa nộp biên bản

### 5.3.2. Periodic Work Management
Module lớn quản lý công việc định kỳ.

Gồm 2 nhánh:

#### a. Periodic Maintenance
Quản lý bảo trì định kỳ hệ thống / thiết bị.

Chức năng:

- Cấu hình hạng mục bảo trì và chu kỳ
- Tự sinh job khi đến hạn
- Cảnh báo đến hạn / quá hạn
- Cập nhật kết quả bảo trì
- Upload biên bản bảo trì
- Tự sinh kỳ tiếp theo sau khi hoàn thành

#### b. Periodic Operation Tasks
Quản lý công tác vận hành định kỳ.

Chức năng:

- Cấu hình loại công tác và chu kỳ
- Tự sinh công việc khi đến hạn
- Cảnh báo quá hạn
- Cập nhật trạng thái thực hiện
- Upload file báo cáo optional
- Tự sinh kỳ tiếp theo sau khi hoàn thành

### 5.3.3. Incident Work Management
Quản lý công việc phát sinh ngoài luồng thường xuyên.

Phạm vi chính gồm 2 nhóm:

1. **Xây dựng và nội thất**
2. **Cơ điện**

Chức năng:

- Tạo công việc phát sinh
- Cập nhật đơn vị thực hiện
- Cập nhật tiến độ
- Cập nhật nghiệm thu
- Cập nhật chi phí
- Upload 1 file hồ sơ tổng
- Quản lý trạng thái:
  - Mới tạo
  - Đang thực hiện
  - Hoàn thành

## 5.4. Reporting and Scheduling Modules

### 5.4.1. Operation Report Management
Quản lý báo cáo vận hành.

Chức năng:

- Tổng hợp dữ liệu từ các module kỹ thuật
- Tạo báo cáo tháng
- Tạo báo cáo năm học
- Hiển thị báo cáo trên web
- Xuất Excel
- Xuất PDF
- Nhập kiến nghị / đề xuất
- Cho phép giám sát hoặc admin lập / chốt báo cáo

### 5.4.2. Duty Schedule Management
Quản lý lịch trực kỹ thuật / bảo vệ.

Chức năng:

- Tạo lịch trực cơ bản
- Cập nhật lịch trực
- Xem lịch trực theo thời gian

## 5.5. Administration Modules

### 5.5.1. User Management
Quản lý người dùng đăng nhập hệ thống.

Chức năng:

- Tạo user
- Cập nhật user
- Khóa / mở user
- Gán role cho user

### 5.5.2. Role Management
Quản lý vai trò trong hệ thống.

Chức năng:

- Tạo role
- Sửa role
- Gán permission cho role

### 5.5.3. Permission Management
Quản lý danh sách permission.

Chức năng:

- Định nghĩa quyền truy cập cho từng chức năng
- Hỗ trợ mô hình phân quyền mở rộng

### 5.5.4. System Configuration / Master Data
Quản lý cấu hình và danh mục dùng chung khác của hệ thống.

Chức năng:

- Cấu hình hệ thống
- Quản lý danh mục kỹ thuật dùng chung
- Quản lý các tham số phục vụ vận hành

---

# 6. Reporting Scope and Technical Architecture Direction

## 6.1. Reporting Scope
Hệ thống cần hỗ trợ báo cáo vận hành ở 2 cấp độ chính:

- Báo cáo tháng
- Báo cáo năm học

Trong đó báo cáo năm học được tính theo mốc:

**01/08 → 31/05**

## 6.2. Reporting Data Sources
Báo cáo vận hành sẽ tổng hợp dữ liệu từ các module sau:

- Repair Management
- Daily Risk Inspection
- Periodic Work Management
- Incident Work Management

Không bao gồm:

- Duty Schedule Management

## 6.3. Reporting Output Types
Hệ thống cần hỗ trợ 3 hình thức đầu ra báo cáo:

- Xem báo cáo trên web
- Xuất file Excel
- Xuất file PDF

## 6.4. Report Content Structure
Mỗi báo cáo vận hành cần gồm 2 nhóm nội dung:

### 6.4.1. Operational Statistics
Bao gồm các số liệu vận hành tổng hợp, ví dụ:

- Số lượng phiếu báo hỏng
- Số lượng phiếu hoàn thành
- Số lượng biên bản kiểm tra hằng ngày
- Số lỗi ghi nhận trong kiểm tra
- Số công việc định kỳ đến hạn / hoàn thành / quá hạn
- Số công việc phát sinh
- Các chỉ số khác phục vụ quản lý vận hành

Các thống kê cần hỗ trợ tổng hợp theo nhiều chiều, bao gồm:

- Theo cơ sở
- Theo khu
- Theo tháng
- Theo năm học

### 6.4.2. Management Notes
Bao gồm các nội dung do người lập báo cáo nhập:

- Kiến nghị
- Đề xuất

## 6.5. Report Ownership
Người có quyền lập và chốt báo cáo:

- Technical Supervisor
- System Admin

## 6.6. Technical Architecture Direction
Hệ thống được định hướng triển khai theo kiến trúc web application nội bộ cho trường học.

### 6.6.1. Technology Stack Direction
Frontend:

- HTML
- CSS
- Vanilla JavaScript

Template Engine:

- EJS

Backend:

- Node.js
- Express.js

Database:

- PostgreSQL

Infrastructure:

- Ubuntu Server
- Nginx
- PM2

### 6.6.2. Data Architecture Direction
Hệ thống sử dụng:

**1 database chung**

Toàn bộ dữ liệu nghiệp vụ cần được phân tách theo:

**campus_id**

hoặc trường tương đương.

Mục tiêu:

- Quản lý nhiều cơ sở trong cùng một hệ thống
- Dùng chung danh mục nền
- Dễ tổng hợp báo cáo liên cơ sở
- Giữ codebase đơn giản

### 6.6.3. Application Access Context
Người dùng khi vào hệ thống sẽ làm việc theo **context cơ sở**.

Ý nghĩa:

- Hệ thống cần có bước chọn cơ sở khi bắt đầu làm việc
- Toàn bộ dữ liệu hiển thị / thao tác sẽ theo cơ sở đang chọn
- Các user đặc biệt có thể được cấp quyền một hoặc nhiều cơ sở

### 6.6.4. Permission Model Direction
Hệ thống áp dụng mô hình:

**Role + Permission**

để:

- Mở rộng linh hoạt trong tương lai
- Không phụ thuộc vào hard-code role tĩnh
- Kiểm soát quyền theo module và chức năng

### 6.6.5. Initial Development Philosophy
Giai đoạn đầu của hệ thống ưu tiên:

- Logic nghiệp vụ rõ ràng
- Giao diện dễ dùng
- Dữ liệu sạch và nhất quán
- Dễ mở rộng về sau

Các tính năng nâng cao chưa ưu tiên ở phase đầu:

- Audit log chi tiết
- Workflow phức tạp cho lịch trực
- Danh mục hóa quá sâu các loại công việc phát sinh
- Các phân hệ quá chi tiết ngoài phạm vi vận hành cốt lõi

---

# 7. Phase 1 Development Scope

## 7.1. Phase 1 Development Objective
Giai đoạn 1 của hệ thống tập trung vào việc xây dựng **core operational platform** cho công tác quản lý cơ sở vật chất và vận hành kỹ thuật của trường.

Mục tiêu của phase 1 là:

- Số hóa quy trình báo hỏng và sửa chữa
- Số hóa quy trình kiểm tra vận hành hằng ngày
- Quản lý công việc định kỳ
- Quản lý công việc phát sinh
- Tạo báo cáo vận hành trên web và xuất file
- Xây dựng nền tảng danh mục và phân quyền để mở rộng lâu dài

## 7.2. In-Scope for Phase 1

### 7.2.1. Master Data
- Cơ sở
- Tòa / tầng / phòng
- Loại phòng
- Loại CSVC / thiết bị
- Mapping loại phòng → loại CSVC
- Khu vận hành
- Role / permission / user
- Cấu hình hệ thống cơ bản

### 7.2.2. Repair Workflow
- Guest portal hiển thị bảng kết quả sửa chữa
- Form báo hỏng
- Danh sách chờ tiếp nhận
- Kỹ thuật nhận và xử lý phiếu
- Cập nhật trạng thái đến hoàn thành

### 7.2.3. Daily Risk Inspection
- Tạo biên bản kiểm tra theo cơ sở / khu
- Ghi nhận OK / Lỗi
- Ảnh optional
- Ghi chú lỗi
- Cảnh báo quá giờ chưa nộp

### 7.2.4. Periodic Work
- Bảo trì định kỳ
- Công tác vận hành định kỳ
- Tự sinh việc đến hạn
- Cảnh báo quá hạn
- Tự sinh chu kỳ tiếp theo

### 7.2.5. Incident Work
- Tạo và quản lý công việc phát sinh
- Theo dõi tiến độ
- Theo dõi nghiệm thu
- Theo dõi chi phí
- Upload hồ sơ tổng

### 7.2.6. Operation Reports
- Báo cáo tháng
- Báo cáo năm học
- Xem báo cáo trên web
- Xuất Excel
- Xuất PDF
- Nhập kiến nghị / đề xuất

### 7.2.7. Duty Schedule
- Lịch trực kỹ thuật / bảo vệ đơn giản

### 7.2.8. Guest Portal
Guest portal là điểm truy cập công khai chính thức của hệ thống, đóng vai trò:

- Kênh công khai để báo hỏng
- Nơi hiển thị bảng kết quả sửa chữa
- Điểm kết nối giữa người dùng không đăng nhập và đội kỹ thuật

## 7.3. Out-of-Scope for Phase 1
Các nội dung chưa ưu tiên ở phase 1:

- Audit log chi tiết
- Workflow thay ca / phân ca phức tạp
- Workflow phê duyệt nhiều bước
- Danh mục hóa sâu cho công việc phát sinh
- Tách nhiều database theo cơ sở
- Các phân hệ ngoài phạm vi quản lý vận hành CSVC

## 7.4. Expected Outcome of Phase 1
Sau phase 1, hệ thống cần đạt được:

- Có thể vận hành thực tế trong trường
- Thay thế phần lớn thao tác Excel / sổ ghi chép hiện tại
- Chuẩn hóa dữ liệu CSVC theo cơ sở
- Theo dõi được sửa chữa, kiểm tra, công việc định kỳ, công việc phát sinh
- Hỗ trợ lập báo cáo quản lý
- Sẵn sàng mở rộng sang các phase tiếp theo
- Có guest portal làm điểm truy cập công khai chính thức cho báo hỏng và theo dõi kết quả sửa chữa

## 7.5. Final Positioning of the System
CSVC Management System là hệ thống nội bộ dành cho trường học, được thiết kế để phục vụ quản lý vận hành cơ sở vật chất và kỹ thuật, không phải sản phẩm SaaS đa khách hàng.

Hệ thống được xây dựng theo hướng:

- Nghiệp vụ rõ
- Dữ liệu sạch
- Giao diện dễ dùng
- Dễ mở rộng trong tương lai

Guest portal là điểm truy cập công khai chính thức của hệ thống dành cho người dùng không đăng nhập.

---

# End of Document
