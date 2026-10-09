import { Router } from "express";
import db from "../db.js";

const router = Router();

/**
 * GET /api/variants/:id
 * Get a single variant.
 */
router.get("/:id", (req, res) => {
  try {
    const variant = db
      .prepare("SELECT * FROM variants WHERE id = ?")
      .get(Number(req.params.id));

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    res.json(variant);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/variants/:id
 * Update a variant's price and/or inventory.
 *
 * Expected body (all fields optional):
 * {
 *   "name": "Updated Name",
 *   "sku": "NEW-SKU",
 *   "price_cents": 1999,
 *   "inventory_count": 50
 * }
 */
router.put("/:id", (req, res) => {
  // TODO: Implement variant update
  // 1. Validate that the variant exists
  // 2. Validate: price_cents >= 0, inventory_count >= 0, sku is unique (if changed)
  // 3. Update the variant in the database
  // 4. Return the updated variant
  try {
    const id = Number(req.params.id);
    const existing = db.prepare("SELECT * FROM variants WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({error: "Variant not found"});

    const {name, sku, price_cents, inventory_count} = req.body;

    
    if (!Number.isInteger(Number(price_cents)) || price_cents < 0){
      return res.status(400).json({ error: "Price needs to be a float with up to two decimals which is greater than 0" });  
    }

    if (!Number.isInteger(Number(inventory_count)) || inventory_count < 0)
      return res.status(400).json({ error: "Inventory must be a whole number, 0 or more" });
    
    db.prepare(
      `UPDATE variants
        SET sku = COALESCE(?, sku), 
        name = COALESCE(?, name),
        price_cents = COALESCE(?, price_cents),
        inventory_count = COALESCE(?, inventory_count),
        updated_at = datetime('now')
      WHERE id = ?`).run(sku?.trim() ?? null, name?.trim() ?? null, price_cents ?? null, inventory_count ?? null, id);
      
      res.json(db.prepare("SELECT * FROM variants WHERE id = ?").get(id));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    res.status(500).json({error:message});
  }

});

/**
 * DELETE /api/variants/:id
 * Delete a variant permanently.
 */
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    const variant = db
      .prepare("SELECT * FROM variants WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // Prevent deleting the last variant of a product
    const siblingCount = db
      .prepare(
        "SELECT COUNT(*) AS count FROM variants WHERE product_id = ?"
      )
      .get(variant.product_id as number) as { count: number };

    if (siblingCount.count <= 1) {
      return res
        .status(400)
        .json({ error: "Cannot delete the last variant of a product" });
    }

    db.prepare("DELETE FROM variants WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
