<?php

namespace App\Enum;

enum SplitMode: string
{
    case Equal = 'equal';
    case Weighted = 'weighted';
    case Custom = 'custom';
}
