// Module: Master Data
// Routes: Master Data API
// Middleware order: campus → auth → permission → controller
const express = require('express');
const router = express.Router();

const controller = require('./master-data.controller');
const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware');

// Building
router.get('/building', permissionMiddleware('master-data.view'), controller.getBuildings);
router.get('/building/:id', permissionMiddleware('master-data.view'), controller.getBuildingDetail)
router.post('/building', permissionMiddleware('master-data.create'), controller.createBuilding);
router.put('/building/:id', permissionMiddleware('master-data.update'), controller.updateBuilding);
router.delete('/building/:id', permissionMiddleware('master-data.delete'), controller.deleteBuilding);

// Floor
router.get('/floor', permissionMiddleware('master-data.view'), controller.getFloors);
router.get('/floor/:id', permissionMiddleware('master-data.view'), controller.getFloorDetail)
router.post('/floor', permissionMiddleware('master-data.create'), controller.createFloor);
router.put('/floor/:id', permissionMiddleware('master-data.update'), controller.updateFloor);
router.delete('/floor/:id', permissionMiddleware('master-data.delete'), controller.deleteFloor);

// Room
router.get('/room', permissionMiddleware('master-data.view'), controller.getRooms);
router.get('/room/:id', permissionMiddleware('master-data.view'), controller.getRoomDetail)
router.post('/room', permissionMiddleware('master-data.create'), controller.createRoom);
router.put('/room/:id', permissionMiddleware('master-data.update'), controller.updateRoom);
router.delete('/room/:id', permissionMiddleware('master-data.delete'), controller.deleteRoom);

// Room Type
router.get('/room-type', permissionMiddleware('master-data.view'), controller.getRoomTypes);
router.get('/room-type/:id', permissionMiddleware('master-data.view'), controller.getRoomTypeDetail)
router.post('/room-type', permissionMiddleware('master-data.create'), controller.createRoomType);
router.put('/room-type/:id', permissionMiddleware('master-data.update'), controller.updateRoomType);
router.delete('/room-type/:id', permissionMiddleware('master-data.delete'), controller.deleteRoomType);

// Asset
router.get('/asset', permissionMiddleware('master-data.view'), controller.getAssets);
router.get('/asset/:id', permissionMiddleware('master-data.view'), controller.getAssetDetail)
router.post('/asset', permissionMiddleware('master-data.create'), controller.createAsset);
router.put('/asset/:id', permissionMiddleware('master-data.update'), controller.updateAsset);
router.delete('/asset/:id', permissionMiddleware('master-data.delete'), controller.deleteAsset);
// Room_Type_Asset

router.get('/room-type-asset', permissionMiddleware('master-data.view'), controller.getRoomTypeAssets)

router.post('/room-type-asset/toggle', permissionMiddleware('master-data.create'), controller.toggleRoomTypeAsset)

// ROOM NAME
router.get('/room-name', permissionMiddleware('master-data.view'), controller.getRoomNames)
router.post('/room-name', permissionMiddleware('master-data.create'), controller.upsertRoomName)
// IMPORT ROOM NAME
router.post('/import/room-names', permissionMiddleware('master-data.create'), controller.importRoomNames);

// =====================================================
// PUBLIC API (NO LOGIN)
// =====================================================

// Public - Location list (Campus → Building → Floor → Room)
router.get('/location', controller.getLocationPublic);

// Public - Asset by Room
router.get('/asset-by-room/:room_id', controller.getAssetsByRoomPublic);


module.exports = router;