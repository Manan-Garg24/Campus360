const Department = require("../models/Department");

// Create department
const createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({
                message: "Name and code are required"
            });
        }

        // Check if department already exists
        const existingDepartment = await Department.findOne({
            $or: [
                { name },
                { code: code.toUpperCase() }
            ]
        });

        if (existingDepartment) {
            return res.status(400).json({
                message: "Department already exists"
            });
        }

        // Create department
        const department = await Department.create({
            name,
            code,
            description
        });

        res.status(201).json({
            message: "Department created successfully",
            department
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .sort({ name: 1 });

        res.status(200).json({
            count: departments.length,
            departments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get single department
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            department
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update department
const updateDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            {
                name,
                code,
                description
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            message: "Department updated successfully",
            department
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete department
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            message: "Department deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};