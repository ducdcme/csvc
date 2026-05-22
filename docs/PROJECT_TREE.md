csvc
│
├ server.js
├ package.json
│
├ config
│   ├ db.js
│   └ env.js
│
├ routes
│   ├ dashboard.js
│   ├ tech.js
│   ├ incidents.js
│   ├ report.js
│   ├ devices.js
│   ├ users.js
│   └ users.js
│
├ controllers
│   ├ dashboardController.js
│   ├ techController.js
│   ├ reportController.js
│   └ userController.js
│
├ services
│   ├ techService.js
│   ├ incidentService.js
│   └ maintenanceService.js
│
├ models
│   ├ Report.js
│   ├ Device.js
│   ├ Incident.js
│   ├ MaintenanceTask.js
│   └ Admin-supervisor.js
│
├ views
│
│   ├ layouts
│   │     main.ejs
│   │
│   ├ components
│   │     header.ejs
│   │     sidebar.ejs
│   │     footer.ejs
│   │     table.ejs
│   │     card.ejs
│   │
│   ├ pages
│   │
│   │     report
│   │        report.ejs
│   │
│   │     tech
│   │         maintenance_dashboard.ejs
│   │         maintenance_task.ejs
│   │         maintenance_board.ejs
│   │
│   │     Admin-supervisor Dasboar
│   │         admin-dashboard.ejs
│   │         sup-dashboar.ejs
│   │         
│   │
│   │     user
│   │         room_list.ejs
│   │
│   │     devices
│   │         device_list.ejs
│
├ public
│
│   ├ css
│   │     main.css
│   │
│   ├ js
│   │
│   │     core
│   │         layout.js
│   │         api.js
│   │
│   │     modules
│   │
│   │         tech
│   │             maintenance.js
│   │             board.js
│   │             timeline.js
│   │
│   │         incident
│   │             incident.js
│   │
│   │         report
│   │             report.js
│   │
│   └ images
│
└ database
      schema.sql