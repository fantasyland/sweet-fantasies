macro $semigroup {
  case ($x) => {
    $x
  }
  case ($x + $rest ...) => {
    $x.concat($semigroup($rest ...))
  }
}
