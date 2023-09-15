const express = require("express");
const { fetchBrands, createBrand } = require("../controller/Brand");
const { Category } = require("../model/category");
const { createCategory } = require("../controller/Category");
const router =express.Router();
router.get('/',fetchBrands).post('/',createBrand);

exports.router = router;
