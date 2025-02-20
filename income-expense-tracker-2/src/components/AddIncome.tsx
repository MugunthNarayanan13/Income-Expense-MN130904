"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "./ui/select";

import AddCategoryDialog from "./AddCategoryDialog";

// income_id integer PK
// amount numeric NOT NULL
// date date NOT NULL DEFAULT now()
// category_id integer NOT NULL
// payment_method_id integer NOT NULL
// description text NULL DEFAULT NULL

const addIncomeSchema = z.object({
  amount: z.coerce.number().gt(0, { message: "Amount must be greater than 0" }), // Coerce to number, form data is always string so we need to convert it to number
  date: z.string(),
  category_id: z.string().nonempty({ message: "Category is required" }),
  payment_method_id: z.string().nonempty({ message: "Payment Method ID is required" }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof addIncomeSchema>;

export default function AddIncome() {
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  type Category = {
    category_id: number;
    category_name: string;
  };
  type PaymentMethod = {
    payment_method_id: number;
    payment_method_name: string;
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetch("/api/category?associated_with=income")
      .then((res) => res.json())
      .then((data) => setCategories(data || []));

    fetch("/api/payment_method")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data || []));
  }, []);

  const form = useForm<z.infer<typeof addIncomeSchema>>({
    resolver: zodResolver(addIncomeSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      category_id: "",
      payment_method_id: "",
      description: ""
    },
  });

  const { register, formState: { errors }, handleSubmit, reset } = form;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setBackendError(null);
    try {
      const response = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add income");
      }
      reset();
      setIncomeDialogOpen(false);
      alert("Income added successfully!");
    } catch (error) {
      setBackendError((error as Error).message || "Error adding income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIncomeDialogOpen(true)} style={{ backgroundColor: 'green', color: 'white' }}> Add Income </Button>
      <Dialog open={incomeDialogOpen} onOpenChange={(open) => {
        setIncomeDialogOpen(open);
        if (!open) {
          reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>Fill in the details below to add a new income entry.</DialogDescription>
          </DialogHeader>
          {backendError && (
            <div className="bg-red-500 text-white p-3 mt-4 rounded-md">
              <strong>Error: </strong>{backendError}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Amount Field */}
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Amount" {...field} value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  {errors.amount && <FormMessage>{errors.amount.message}</FormMessage>}
                </FormItem>
              )} />

              {/* Date Field */}
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  {errors.date && <FormMessage>{errors.date.message}</FormMessage>}
                </FormItem>
              )} />

              {/* Category ID Field */}
              <FormField control={form.control} name="category_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Button
                    type="button"
                    onClick={(event) => {
                      // event.preventDefault();
                      setIsAddCategoryOpen(true);
                    }} variant="outline">
                    Add New Category
                  </Button>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                            {cat.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Payment Method ID Field */}
              <FormField control={form.control} name="payment_method_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((pm) => (
                          <SelectItem key={pm.payment_method_id} value={String(pm.payment_method_id)}>
                            {pm.payment_method_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Description Field */}
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea {...field} placeholder="Description (optional)" />
                  </FormControl>
                  {errors.description && <FormMessage>{errors.description.message}</FormMessage>}
                </FormItem>
              )} />

              <DialogFooter>
                {/* Submit button */}
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => reset()}
                >
                  Clear
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AddCategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onCategoryAdded={(newCat) => {
          setCategories([...categories, newCat]);
          form.setValue("category_id", String(newCat.category_id));
        }}
        associatedWith="income"
      />
    </>
  );
};
