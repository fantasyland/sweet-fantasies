macro $semigroup {
    case {_ ($x)} => {
        return #{
            $x
        };
    }
    case {_ ($x + $rest ...)} => {
        return #{
            $x.concat($semigroup($rest ...))
        };
    }
}