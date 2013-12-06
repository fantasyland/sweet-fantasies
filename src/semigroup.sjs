macro $semigroup {    
    case {_ ($x + $rest ...)} => {
        return #{
            $x.concat($semigroup($rest ...))
        };
    }
    case {_ ($x)} => {
        return #{
            $x
        };
    }
}