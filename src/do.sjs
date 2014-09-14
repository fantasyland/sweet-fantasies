/*
   $do {
     x <- foo
     y <- bar
     z <- baz
     return x * y * z
   }

   Desugars into:

   (function(){
     return foo.chain(function(x) { 
       return bar.chain(function(y) { 
         return baz.map(function(z) { 
           return x * y * z 
         }) 
       })
     })
   }())

   var-bindings are supported too:

   $do {
     x <- foo
     var k = 10
     y <- bar(x)
     z <- baz
     return x * y * z * k
   }

   Variable binding is optional if monad is executed just for its effects:

   $do {
     putStrLn("Hello friend! What's your name?")
     readLine()
   }

*/

macro $do {
  rule {{ $a ... }} => {
    (function(){ _do { $a ... } }())
  }
}

macroclass binding {
  pattern { $id:ident <- $op:expr; } 
  pattern { $id:ident <- $op:expr  }
  pattern { $op:expr; } where ($id = #{ _it })
  pattern { $op:expr  } where ($id = #{ _it })
}

macroclass pureBinding {
  pattern { $id:ident <- return $value:expr; }
  pattern { $id:ident <- return $value:expr }
  pattern { return $value:expr; } where ($id = #{ _it })
  pattern { return $value:expr  } where ($id = #{ _it })
}

macroclass vardecl {
  pattern { var $id:ident = $value:expr; }
  pattern { var $id:ident = $value:expr  }
}

macro returnableExpr {
  rule { $e:expr } => { $e }
  rule { return $e:expr } => { return $e }
}

macroclass ifelsedo {
  pattern { if ( $test:expr ) $consequent:returnableExpr else $alternative:returnableExpr; }
  pattern { if ( $test:expr ) $consequent:returnableExpr else $alternative:returnableExpr }
}

macro _do {
  // -- Base cases -----------------------------------------------------
  rule {{ $op:expr ; ... }} => {
    return $op
  }
  rule { $type { $op:expr ; ... }} => {
    return $op
  }
  rule { $type { return $a:expr ; ... }} => {
    return $type($a)
  }
  rule { $type { return if ( $a:expr ) $b:expr ; ... else $c:expr ; ... }} => {
    if ($a) {
      _do $type { return $b }
    } else {
      _do $type { return $c }
    }
  }

  // -- Stepping cases -------------------------------------------------
  rule { $type { $a:ifelsedo $rest ... }} => {
    if ($a$test) {
      _do $type { $a$consequent $rest ... }
    } else {
      _do $type { $a$alternative $rest ... }
    }
  }
  rule {{ $a:ifelsedo $rest ... }} => {
    if ($a$test) {
      _do { $a$consequent $rest ... }
    } else {
      _do { $a$alternative $rest ... }
    }
  }

  rule { $type { $a:pureBinding $rest ... }} => {
    return $type($a$value).chain(function($a$id) {
      _do $type { $rest ... }
    })
  }

  rule {{ $a:binding $rest ... }} => {
    var $do$op   = $a$op;
    var $do$type = $do$op.of || $do$op.constructor.of;
    return $do$op.chain(function($a$id) {
      _do $do$type { $rest ... }
    })
  }
  rule { $type { $a:binding $rest ... }} => {
    return $a$op.chain(function($a$id) {
      _do $type { $rest ... }
    })
  }

  rule { $type { $var:vardecl $rest ... }} => {
    var $var$id = $var$value;
    _do $type { $rest ... }
  }
  rule {{ $var:vardecl $rest ... }} => {
    var $var$id = $var$value;
    _do { $rest ... }
  }


  // -- Things we ignore -----------------------------------------------
  rule { $type { ; $a ... } } => { _do { $a ... } }
  rule { $type { } } => { }
}

export $do
