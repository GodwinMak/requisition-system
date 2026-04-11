const db = require("../models");
const Stock = db.stock;
const MaterialCategory = db.materialCategory;


exports.createMaterialCaterory = async (req, res) => {
 try {
    const {name, description} = req.body;
    const checkCategory = await MaterialCategory.findOne({ where: { name } });
    if (!checkCategory) {
        return res.status(404).json({ message: "Material category not found" });
    }

    const newMaterialCategory = await MaterialCategory.create({
        name,
        description,
    })
    res.status(201).json({ message: "Material Category created successfully", materialCategory: newMaterialCategory });
 } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
 }
}

exports.createStock = async (req, res) => {
    try {
        const { items_description, material_category_id, available_qty, balance_qty } = req.body;
        const checkCategory = await MaterialCategory.findOne({ where: { id: material_category_id } });
        if (!checkCategory) {
            return res.status(404).json({ message: "Material category not found" });
        }

        const newStock = await Stock.create({
            items_description,
            material_category_id,
            available_qty,
            balance_qty
        })
        res.status(201).json({ message: "Stock created successfully", stock: newStock });
     } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
     }
}