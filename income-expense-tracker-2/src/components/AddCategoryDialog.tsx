"use client";

import React, { useState } from "react";

import { Button } from "./ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "./ui/dialog";
import { Input } from "./ui/input";

interface AddCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCategoryAdded: (newCat: { category_id: number; category_name: string }) => void;
    associatedWith: "income" | "expense";
}

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Enter the new category name.</DialogDescription>
                </DialogHeader>
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
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}