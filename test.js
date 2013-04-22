var expect = require("expect.js")

function Id(a) { this.value = a }

Id.prototype.concat = function(b) {
  return new Id(this.value.concat(b.value))
}

Id.prototype.zero = function() {
  return new Id(this.value.zero ? this.value.zero() : this.value.constructor.zero())
}

Id.prototype.map = function(f) {
  return new Id(f(this.value))
}

Id.prototype.ap = function(b) {
  return new Id(this.value(b.value))
}

Id.prototype.chain = function(f) {
  return f(this.value)
}

Id.of = function(a) {
  return new Id(a)
}

describe("semigroup", function() {
  it("concats values", function() {
    var x = Id.of("foo")
    var y = Id.of("bar")
    var s = $semigroup (x + y)
    expect(s.value).to.equal("foobar")
  })
})

describe("do-notation", function() {
  it("chains computations", function() {
    var sum = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      return x + y
    }
    expect(sum.value).to.equal(30)
  })

  it("supports var-bindings", function() {
    var sum = $do {
      x <- Id.of(10)
      k = 5
      y <- Id.of(20)
      return x + y + k
    }
    expect(sum.value).to.equal(35)
  })

  it("binding name is optional", function() {
    var sum = $do {
      x <- Id.of(10)
      Id.of(100)
      y <- Id.of(20)
      return x + y
    }
    expect(sum.value).to.equal(30)
  })

  it("supports simple if-expressions", function() {
    var sum1 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      if (x == 10) return x + y else return x - y
    }
    expect(sum1.value).to.equal(30)

    var sum2 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      if (x > 10) return x + y else return x - y
    }
    expect(sum2.value).to.equal(-10)
  })

  it("supports if-expressions", function() {
    var sum1 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      if (x == 10) $do {
        z <- Id.of(30)
        return x + z 
      } else $do {
        z <- Id.of(40)
        return x - z
      }
    }
    expect(sum1.value).to.equal(40)

    var sum2 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      return if (x == 10) $do {
        z <- Id.of(30)
        return x + z 
      } else $do {
        z <- Id.of(40)
        return x - z
      }
    }
    expect(sum2.value.value).to.equal(40)
  })

  it("supports if-expressions after non-bound expression", function() {
    var sum1 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      Id.of(1000)
      if (x == 10) return x + y else return x - y
    }
    expect(sum1.value).to.equal(30)

    var sum2 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      Id.of(1000)
      if (x == 10) $do {
        z <- Id.of(30)
        return x + z 
      } else $do {
        z <- Id.of(40)
        return x - z
      }
    }
    expect(sum2.value).to.equal(40)
  })

  it("supports nested do-blocks", function() {
    var sum1 = $do {
      x <- Id.of(10)
      y <- $do {
        z <- Id.of(30)
        return x + z
      }
      return x + y
    }
    expect(sum1.value).to.equal(50)

    var sum2 = $do {
      x <- Id.of(10)
      y <- $do {
        z <- Id.of(30)
        return x + z
      }
      z <- Id.of(40)
      return x + y + z
    }
    expect(sum2.value).to.equal(90)
  })
})

describe("ap-notation", function() {
  it("applies applicatives", function() {
    var f = Id.of(function(x) { return function(y) { return x+y }})
    var x = Id.of(10)
    var y = Id.of(20)
    var sum = $ap f(x, y)
    expect(sum.value).to.equal(30)
  })

  it("supports nesting", function() {
    var f = Id.of(function(x) { return function(y) { return x+y }})
    var x = Id.of(10)
    var y = Id.of(20)
    var sum = $ap f(x, $ap f(x, y))
    expect(sum.value).to.equal(40)
  })

  it("supports inline creation of applicative", function() {
    var x = Id.of(10)
    var y = Id.of(20)
    var sum = $ap (Id.of(function(x) { return function(y) { return x+y }}))(x, y)
    expect(sum.value).to.equal(30)
  })
})
