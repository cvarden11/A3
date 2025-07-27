import Footer from "../components/footer";
import Header from "../components/header";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "@/context/authContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


enum Category {
    Electronics = "electronics",
    Clothing = "clothing",
    Home = "home",
    Beauty = "beauty",
    Sports = "sports",
    Toys = "toys",
    Books = "books",
    Other = "other"
}

const BASE_API_URL = import.meta.env.VITE_API_URL;

export default function UploadProductPage() {
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { user } = useAuth();

    const validationSchema = Yup.object({
        productName: Yup.string().required("Product name is required"),
        productDescription: Yup.string().required("Product description is required"),
        productPrice: Yup.number()
            .typeError("Price must be a number")
            .required("Product price is required")
            .min(0, "Price must be a positive number"),
        productStock: Yup.number()
            .typeError("Stock must be a number")
            .required("Product stock is required")
            .min(0, "Stock must be a non-negative number"),
        productImage: Yup.string()
            .url("Invalid image URL format")
            .required("Product image URL is required"),
        productCategory: Yup.string().required("Product category is required"),
    });

    const formik = useFormik({
        initialValues: {
            productName: "",
            productDescription: "",
            productPrice: "",
            productStock: "",
            productImage: "",
            productCategory: "",
        },
        validationSchema,
        onSubmit: handleUploadProduct,
    });

    async function handleUploadProduct(values: any) {
        
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${BASE_API_URL}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: values.productName,
                    description: values.productDescription,
                    price: parseFloat(values.productPrice),
                    stock: parseInt(values.productStock),
                    imageUrl: values.productImage,
                    category: values.productCategory,
                    vendorId: user?.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error uploading product:", errorData);
                setError(errorData.message || "Failed to upload product.");
            } else {
                const data = await response.json();
                console.log("Product uploaded successfully:", data);
                formik.resetForm();
                setSuccessMessage("Product uploaded successfully!");

                setTimeout(() => {
                    setSuccessMessage(null);
                }, 5000);
            }
        } catch (err) {
            console.error("Network or unexpected error:", err);
            setError("Failed to upload product. Please check your connection and try again.");
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header page="upload-product" role="vendor"/>
            <main className="flex-grow pt-28 pb-12 px-4 max-w-xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-8">Upload Product</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Upload New Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={formik.handleSubmit}>
                            <div>
                                <Label htmlFor="productName">Product Name</Label>
                                <Input
                                    id="productName"
                                    name="productName"
                                    type="text"
                                    placeholder="Enter product name"
                                    value={formik.values.productName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.productName && formik.errors.productName && (
                                    <div className="text-red-500 text-xs">{formik.errors.productName}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="productDescription">Description</Label>
                                <Textarea
                                    id="productDescription"
                                    name="productDescription"
                                    placeholder="Enter product description"
                                    value={formik.values.productDescription}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.productDescription && formik.errors.productDescription && (
                                    <div className="text-red-500 text-xs">{formik.errors.productDescription}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="productPrice">Price</Label>
                                <Input
                                    id="productPrice"
                                    name="productPrice"
                                    type="number"
                                    placeholder="Enter product price"
                                    value={formik.values.productPrice}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.productPrice && formik.errors.productPrice && (
                                    <div className="text-red-500 text-xs">{formik.errors.productPrice}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="productStock">Stock</Label>
                                <Input
                                    id="productStock"
                                    name="productStock"
                                    type="number"
                                    placeholder="Enter stock"
                                    value={formik.values.productStock}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.productStock && formik.errors.productStock && (
                                    <div className="text-red-500 text-xs">{formik.errors.productStock}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="productImage">Image URL</Label>
                                <Input
                                    id="productImage"
                                    name="productImage"
                                    type="url"
                                    placeholder="Enter image URL"
                                    value={formik.values.productImage}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.productImage && formik.errors.productImage && (
                                    <div className="text-red-500 text-xs">{formik.errors.productImage}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="productCategory">Product Category</Label>
                                <Select
                                    onValueChange={(value) => formik.setFieldValue("productCategory", value)}
                                    value={formik.values.productCategory}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(Category).map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.productCategory && formik.errors.productCategory && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.productCategory}</div>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
                                {formik.isSubmitting ? "Uploading..." : "Upload Product"}
                            </Button>
                            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                            {successMessage && <p className="text-green-600 text-xs mt-2">{successMessage}</p>}
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}