<?php

namespace App\Enum;

enum ShoppingItemStatus: string
{
    case ToBuy = 'to_buy';
    case Bought = 'bought';
}
