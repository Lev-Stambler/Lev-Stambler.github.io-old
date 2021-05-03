# ZK Snarks

### Preamble

## 1. What is ZK (Zero Knowledge) Anyways?

## 2. Transforming the input
### Code to polynomials
Fun fact! Polynomials (defined as ____) can express arbitrary computation and data
#### Proof
> TODO:

#### Flattening
Each term in a polynomial can be turned into a series of arithmetic equations with just three variables. This is called flattening. "Intermediary" variables may have to be introduced though! Lets give each equation a name, lets call 'em logic gates. (This is the terminology used)

##### Take the following polynomial:
$~out = 3 * x^4 + x^2 + 27$ can be written as the following gates:
$$ tmp1 = x * x $$
$$ tmp2 = (3 * tmp1) * tmp1 $$
$$ tmp3 = tmp1 + tmp2 $$
$$ ~out = tmp3 + 27 $$
Take a second to understand the above example. We will be coming back to this example

<details>
  <summary>Nerd alert</summary>
  TODO: Something about optimization here and the above example
</details>


### Polynomials to R1CS
R1CS, or rank 1 constraint systems, are a group of three integer vectors, call them (**a**, **b**, **c**) with a solution **s**. Think of it like a system of equations where **a** . **s** * **b** . **s** = **c** . **s** where . represents the dot product operation. The size of a, b, c, and s are all the same. The lengths equal the total number of variables in the system + 2. The + 2 comes from two added dummy variables, a ~one variable (set to 1) and an ~out variable. Each gate gets its own rank 1 constraint. But, the **s** is the same for all the R1CSs. Now, lets give some meaning to these vectors. Let each index i in the vector map to some variable we use.

<details><summary>Why the ~one?</summary>
TODO:
</details>

Let's say that position 0 maps to ~one, position 1 to x, and so on. So, the vector mapping would look like:
[~one, x, ~out, tmp1, tmp2, tmp3]. So, the vector [1, 2, 3, 4, 5, 6] tells us that TODO:
<details>
  <summary>Just a standard</summary>
  Its normal to just have ~one be in the 0th position, x in the 1st, and ~out in the 2nd.
</details>


Lets take a look at the example now
$$ tmp1 = x * x $$ gets the following constraint
a = [0 1 0 0 0 0]
b = [0 1 0 0 0 0]
c = [0 0 0 1 0 0].
What does this mean? It means that now s . a * s . b = s . c, and because the 1st index of the solution vector s corresponds to x, and the 3rd index corresponds to tmp1, the above equation **constrains** s such that x * x = tmp1

$$ tmp2 = (3 * tmp1) * tmp1 $$
a = [0 0 0 3 0 0]
b = [0 0 0 1 0 0]
c = [0 0 0 0 1 0].
$$ tmp3 = tmp1 + tmp2 $$
a = [0 0 0 1 1 0]
b = [1 0 0 0 0 0]
c = [0 0 0 0 0 1].
$$ ~out = tmp3 + 27 $$
a = [21 0 0 0 0 1]
b = [1  0 0 0 0 0]
c = [0  0 1 0 0 0].
The last two looks a little weird huh? That's because the dot product of a . s performs the additions. Then, the multiplication with b . s is just an identity multiplication because s = [1 ? ? ? ? ?] and b = [1 0 0 0 0 0]. So b . s = 1.


Now lets group things into an array of vectors (a matrix if you will) by the a's, b's and c's.

A = [
  [0  1 0 0 0 0],
  [0  0 0 3 0 0],
  [0  0 0 1 1 0],
  [21 0 0 0 0 1]
]
B = [
  [0 1 0 0 0 0],
  [0 0 0 1 0 0],
  [1 0 0 0 0 0],
  [1 0 0 0 0 0],
]
C = [
  [0 0 0 1 0 0],
  [0 0 0 0 1 0],
  [0 0 0 0 0 1],
  [0 0 1 0 0 0]
]

#### Creating a witness

Cool, so we have a system of R1CS constraints? Let's see what a witness is. It is simply the assignment to **s** which satisfies all the constraints.

So, an example could be s = [1 2 79 4 48 52]. So x = 2, out = 79, tmp1 = 4, tmp2 = 48, and tmp3 = 79.



### R1CS to QAP

## 3. 