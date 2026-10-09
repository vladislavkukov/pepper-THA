import { Link } from "react-router-dom";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/api";
import { Category } from "@/types";


export default function CreateProductPage() {

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [categories, setCategories] = useState<Category[]>([]);
  const [success, setSuccess] = useState<string|null>(null);

  // Gets available categories for dropdown (code taken from ProductsPage.tsx)
  useEffect(() => {
    fetchCategories()
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
      })
  }, []);

  type Variant = {sku: string, name: string, price: string, inventory: string};
  // Empty variant to be filled in, used for new additions to the list when the user adds one
  const blankVariant: Variant = {sku: '', name: '', price: '0', inventory: '0'};

  const [variants, setVariants] = useState<Variant[]>([blankVariant]);

  // Adds an empty variant to be filled in by iterating over the current list and making one with a new element
  const addVariant = () => setVariants((prev) => [...prev, {...blankVariant}]);
  // Removes a variant by iterating over the list to find the correct one to remove (index in UI is equal to index in list)
  const removeVariant = (index: number) => setVariants((prev) => prev.filter((_,i) => i !== index));
  // Changes a field in a variant by iterating and recreating a list and modifying only the value which matches both the index and field name
  const updateVariant = (index: number, field: string, value: string) => setVariants((prev) =>
    prev.map((n, i) => i===index ? {...n, [field]:value} : n) 
  );

  const [error, setError] = useState<string |null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);

    // Empty checks
    if (!productName.trim()) return setError("Product name is required");
    for (const v of variants) {
      if (!v.sku.trim()) return setError("SKU is required for each variant");
      if (!v.name.trim()) return setError("Name is required for each variant");
    if (Number.isNaN(v.price) || Number(v.price) < 0) return setError("All prices must be 0 or more");
    if (Number.isNaN(v.inventory) || Number(v.inventory) < 0) return setError("Inventories must be whole numbers, 0 or more");
      const skus = variants.map((v) => v.sku.trim());
      if (new Set(skus).size !== skus.length) return setError("Duplicate SKUs in the variants");
    }

    const productWithVar = {
      name: productName.trim(),
      description: description || null,
      category_id: category ? Number(category) : null,
      status: status,
      variants: variants.map((v) => ({
        sku: v.sku.trim(),
        name: v.name.trim(),
        price_cents: (Number(v.price)*100),
        inventory_count: Number(v.inventory),
      }))
    };
    
    setSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(productWithVar)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
  const text = data?.error ?? `Request failed (${res.status} ${res.statusText})`;
  setError(text);
  return;
}

      setSuccess(`Product "${productWithVar.name}" created`);
      setProductName("");
      setDescription("");
      setCategory("")
      setStatus("active");
      setVariants([{ ...blankVariant }]);
    } catch {
      setError("Error reaching the server");
    } finally {
      setSubmitting(false);
    }
       
    }
  


  return (
    <div>
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Create New Product
      </h1>

      {/* ----------------------------------------------------------------
          TODO: Build the create-product form here.

          The form should collect:
            - Product name (required)
            - Description (optional)
            - Category (select from existing categories)
            - Status (active / draft)
            - At least one variant with:
                - SKU (required, must be unique)
                - Variant name (required)
                - Price (>= 0)
                - Inventory count (>= 0)

          On submit, POST to /api/products (see backend route for expected body shape).
          On success, redirect to the new product's detail page.
       ---------------------------------------------------------------- */
       }
  <div className="bg-gray-50 p-5">
    
       <form onSubmit = {handleSubmit}>
        <div className="flex flex-col justify-between gap-8 bg-gray-100 p-4 rounded border">
          <label> Product Name: 
            <input className="px-1 py-1 rounded border border-gray-200"
            type = "text"
            value = {productName}
            onChange={e => setProductName(e.target.value)}
            placeholder="Ex. Green Pepper"
            />
            </label>
            
            <label> Product Description: 
            <input className="w-full py-2 px-1 rounded border border-gray-200"
            type = "text"
            value = {description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex. A pepper that is green"
            />
            </label>
            
            <label> Category: 
            <select className="rounded border border-gray-200"
              value = {category}
              onChange={e => setCategory(e.target.value)}
            >
            <option value="">No category</option>
            {categories.map(category => (<option key = {category.id} value = {category.id}> {category.name} </option>))}

            </select>
            </label>
            
            <label> Status: 
            <select className="rounded border border-gray-200"
              value = {status}
              onChange={e => setStatus(e.target.value)}
            >
            <option>active</option>
            <option>draft</option>

            </select>
            </label>
      </div>
       <div className="bg-gray-200 p-4 rounded border gap-3">
            <h1 className="mt-6 mb-3 font-bold tracking-tight text-foreground md:text-xl">
            Add Variant(s)
            </h1>
            {variants.map((n, i) => (
            <div key={i} className="flex flex-col gap-2">
              SKU:
              <input  value={n.sku} 
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                className="w-full py-1 px-1 rounded border border-gray-200" />
              Name:
              <input value={n.name}
                onChange={(e) => updateVariant(i, "name", e.target.value)}
                className="w-full py-1 px-1 rounded border border-gray-200" />
              Price
              <input value={n.price}
                type="number" min="0"
                onChange={(e) => updateVariant(i, "price", e.target.value)}
                className="w-full py-1 px-1 rounded border border-gray-200" />
              Inventory Count:
              <input value={n.inventory}
                type="number" min="0"
                onChange={(e) => updateVariant(i, "inventory", e.target.value)}
                className="w-full py-1 px-1 rounded border border-gray-200" />

              <button type="button"
                onClick={() => removeVariant(i)}
                className="rounded bg-red-200 py-2"
                disabled={variants.length===1}>
              Remove Variant </button>

              </div>))}
            <button type="button" className="mx-auto block rounded bg-green-100 px-6 py-4 mt-9" onClick={addVariant}> Add New Variant </button>
      </div>

      {success && <p className="text-green-700">{success}</p>}
      {error && <p className="text-red-700">{error}</p>}

      <button className="mx-auto block rounded bg-green-300 px-6 py-4 mt-9"
        type = "submit"
        disabled = {submitting}>
      Submit</button>


       </form>
</div>

    </div>
  );
}
