"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/utils";

export interface CartItemData {
  id: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
  seller: string;
  country: string;
}

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      {/* Image placeholder */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
        Photo
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-sm leading-tight line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.variant} &middot; {item.seller} {item.country}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 border rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-6 text-center">
              {item.quantity}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="font-bold text-cowri-orange">
            {formatFCFA(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
