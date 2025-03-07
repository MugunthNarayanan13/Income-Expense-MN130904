"use client";

import React, { useState } from "react";
import { z } from "zod";

import { Button } from "./ui/button";
import CustomDialog from "@/components/CustomDialog";
import { Input } from "./ui/input";

interface AddCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCategoryAdded: (newCat: { category_id: number; category_name: string }) => void;
    associatedWith: "income" | "expense";
}

const categorySchema = z.object({
    category_name: z.string().nonempty("Category name is required"),
});

export default function AddCategoryDialog({
    open,
    onOpenChange,
    onCategoryAdded,
    associatedWith,
}: AddCategoryDialogProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const parseResult = categorySchema.safeParse({ category_name: name });
        if (!parseResult.success) {
            setError(parseResult.error.issues[0].message);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("/api/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category_name: name, associated_with: associatedWith }),
            });
            if (!res.ok) {
                throw new Error("Failed to create category");
            }
            const data = await res.json();
            onCategoryAdded(data);
            setName("");
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomDialog
            title="Add Category"
            description="Enter the new category name."
            open={open}
            onOpenChange={onOpenChange}
        >
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-md mb-3">
                    {error}
                </div>
            )}
            <form onSubmit={handleAddCategory}>
                <Input
                    placeholder="New category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <div className="mt-4 flex justify-end gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </CustomDialog>
    );
}