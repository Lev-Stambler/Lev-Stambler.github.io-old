# ZK Snarks
<!-- https://medium.com/@VitalikButerin/quadratic-arithmetic-programs-from-zero-to-hero-f6d558cea649 -->
<!-- https://medium.com/@VitalikButerin/exploring-elliptic-curve-pairings-c73c1864e627 -->

## Preamble
<!-- https://z.cash/technology/zksnarks/ -->
ZK Snarks, or Zero-Knowledge Succinct Non-Interactive Argument of Knowledge, according to ZCash, "refers to a proof construction where one can prove possession of certain information, e.g. a secret key, without revealing that information, and without any interaction between the prover and verifier."

Okay, so what does that mean? It basically is just saying that a prover can convince a verifier that the prover has some information. This information is also never revealed to the verifier.

In the real world, this can be used to prove the validity of a transaction. So, Alice could prove to Bob that she has the funds to pay for a shiny new Tesla without ever revealing to Bob how much money she has or any other personal information. In fact, this how [ZCash](https://z.cash/), a private, confidential blockchain, works.

ZK Snarks are also being used for a host of other applications in the block chain world, like solving scalability problems, privacy on chain, and more!

## Outline
The chapter will be broken up into a few different sections:

1. [Transforming the input](#transforming-the-input)
   - Flattening
   - R1CS
   - QAP
   - Bringing it together
2. [Hiding and cryptography]()
   - One way functions
   - Knowledge of coefficients
   - Bringing it together
3. [In the wild](#usage-in-the-wild)
   - Snarky and O(1) labs
4. [Check your understanding](#check-your-understanding)

## Transforming the input
### We start with a polynomial
Fun fact! Polynomials can express arbitrary computation and data.
<details>
  <summary>Polynomial definition</summary>
  <!-- https://byjus.com/maths/polynomial/ -->
  <br />
  According to BYJU, polynomials can be defined as:
  Polynomials are algebraic expressions that consist of variables and coefficients. Variables are also sometimes called indeterminate. We can perform arithmetic operations such as addition, subtraction, multiplication and also positive integer exponents for polynomial expressions but not division by variable. 
</details>
<br />

### Flattening/ unrolling
Each term in a polynomial can be turned into a series of arithmetic equations with just three variables. This is called flattening or unrolling. "Intermediary" variables may have to be introduced though! Lets give each equation a name, lets call 'em logic gates. (This is the terminology used)

##### Take the following polynomial:
$~out = 3 * x^4 + x^2 + 27$ can be written as the following gates:
$$ tmp1 = x * x $$
$$ tmp2 = (3 * tmp1) * tmp1 $$
$$ tmp3 = tmp1 + tmp2 $$
$$ ~out = tmp3 + 27 $$
Take a second to understand the above example. We will be coming back to this example

<details>
  <summary>Nerd alert, optimization</summary>
  A very cool field of research is optimizing to minimize the number of logic gates needed to express a polynomial. Sure, the above polynomial looks simple, but imagine a polynomial with 1,000,000  terms. Then try optimizing that!
  <br />
  <br />
> An exercise to the reader: prove that the decision problem associated with optimizing the unrolling is NP Hard 
</details>
<br />


### Polynomials to R1CS
R1CS, or rank 1 constraint systems, are a group of three integer vectors, call them (**a**, **b**, **c**) with a solution **s**. Think of it like a system of equations where **a** . **s** * **b** . **s** = **c** . **s** where . represents the dot product operation. The size of a, b, c, and s are all the same. The lengths equal the total number of variables in the system + 2. The + 2 comes from two added dummy variables, a ~one variable (set to 1) and an ~out variable. Each gate gets its own rank 1 constraint. But, the **s** is the same for all the R1CSs. Now, lets give some meaning to these vectors. Let each index i in the vector map to some variable we use.


<details><summary>Why the ~one?</summary>
  The one will later be used to help with performing addition of constants. Like the + 27 in our example above.
</details>
<br />

Let's say that position 0 maps to ~one, position 1 to x, and so on. So, the vector mapping would look like:
[~one, x, ~out, tmp1, tmp2, tmp3]. So, the vector [1, 2, 3, 4, 5, 6] tells us that ~one is associated with 1, x with 2 and so on.
<details>
  <summary>Note: Just a standard</summary>
  Its normal to just have ~one be in the 0th position, x in the 1st, and ~out in the 2nd.
</details>
<br />


Lets take a look at the example now:

$tmp1 = x * x$ gets the following constraint:

a = [0 1 0 0 0 0]
<br />
b = [0 1 0 0 0 0]
<br />
c = [0 0 0 1 0 0].

What does this mean? It means that now s . a * s . b = s . c, and because the 1st index of the solution vector s corresponds to x, and the 3rd index corresponds to tmp1, the above equation **constrains** s such that x * x = tmp1

Now for $tmp2 = (3 * tmp1) * tmp1$:
<br />
a = [0 0 0 3 0 0]
<br />
b = [0 0 0 1 0 0]
<br />
c = [0 0 0 0 1 0].
<br />
<br />
For $tmp3 = tmp1 + tmp2$:
<br />
a = [0 0 0 1 1 0]
<br />
b = [1 0 0 0 0 0]
<br />
c = [0 0 0 0 0 1].
<br />
<br />
And for $~out = tmp3 + 27$:
<br />
a = [21 0 0 0 0 1]
<br />
b = [1  0 0 0 0 0]
<br />
c = [0  0 1 0 0 0].
<br />
<br />
The last two looks a little weird huh? That's because the dot product of a . s performs the additions. Then, the multiplication with b . s is just an identity multiplication because s = [1 ? ? ? ? ?] and b = [1 0 0 0 0 0]. So b . s = 1.


Now lets group things into an array of vectors (a matrix if you will) by the a's, b's and c's.

A = [
  [0  1 0 0 0 0],
  <br />
  [0  0 0 3 0 0],
  <br />
  [0  0 0 1 1 0],
  <br />
  [21 0 0 0 0 1]
]

B = [
  [0 1 0 0 0 0],
  <br />
  [0 0 0 1 0 0],
  <br />
  [1 0 0 0 0 0],
  <br />
  [1 0 0 0 0 0],
]

C = [
  [0 0 0 1 0 0],
  <br />
  [0 0 0 0 1 0],
  <br />
  [0 0 0 0 0 1],
  <br />
  [0 0 1 0 0 0]
]

<br />

### Creating a witness

Cool, so we have a system of R1CS constraints? Let's see what a witness is. It is simply the assignment to **s** which satisfies all the constraints.

So, an example could be **s** = [1 2 79 4 48 52]. So x = 2, out = 79, tmp1 = 4, tmp2 = 48, and tmp3 = 79.



### R1CS to QAP

Now we have to take the R1CS and convert it to QAP form (A Quadratic Assignment Problem).
<details>
  <summary>QAP Definition</summary>
  We have n facilities, each to be placed at one of n locations. 
</details>
<br />


How you may ask? Lagrange interpolation!!

<details>
  <summary>What's Lagrange interpolation</summary>
  Check out [this video explaining it](https://www.youtube.com/watch?v=_zK_KhHW6og)!
</details>

In short, the Interpolation theorem will be used. Given $n + 1$ points, a unique polynomial of degree $n$ can be constructed (using Lagrange interpolation) such that the $n + 1$ points are all contained within the $n^{th}$ degree polynomial

Recall the following set of vectors.

A = [
  [0  1 0 0 0 0],
  <br />
  [0  0 0 3 0 0],
  <br />
  [0  0 0 1 1 0],
  <br />
  [21 0 0 0 0 1]
]

B = [
  [0 1 0 0 0 0],
  <br />
  [0 0 0 1 0 0],
  <br />
  [1 0 0 0 0 0],
  <br />
  [1 0 0 0 0 0],
]

C = [
  [0 0 0 1 0 0],
  <br />
  [0 0 0 0 1 0],
  <br />
  [0 0 0 0 0 1],
  <br />
  [0 0 1 0 0 0]
]

Our goal now is to make a set of polynomials $A(i)$ = [$A_0(i), A_1(i), A_2(i), A_3(i)]$,
$B(i)$ = [$B_0(i), B_1(i), B_2(i), B_3(i)$], $C(i)$ = $[C_0(i), C_1(i), C_2(i), C_3(i)]$ such that A(i) gives the ith vector in A, B(i) gives the ith vector in B, C(i) gives the ith vector in C. So, A(0) for example, gives [0 1 0 0 0 0] and C(2) = [0 0 0 0 1 0]

We can use Lagrange interpolation to create all the $A_k(i), B_k(i), C_k(i)$. 

So, for example, we know that $A_0(i)$ must contain the points (0, 0), (1, 0), (2, 0), (3, 21).
<br />
Using Lagrange interpolation, we find that $A_0(i)=3.5 * (x - 2) * (x - 1) * x = 3.5x^3 -10.5x^2 + 7x + 0$

Lets represent it as a vector instead with coefficients in ascending order [0 7 -10.5 3.5]

Now, lets do the same for all the equations of A, this gives us the following set of vectors representing each polynomial

$A(i)$ = [
  [0 7 -10.5 3.5]
  <br/>
  [1 -1.833 1 -0.166]
  <br/>
  [0 0 0 0]
  <br/>
  [0 0.33 -0.5 0.166]
]
### Checking s with QAP
Remember our solution vector s? Lets use it again.
So, take $s . A(i) * s . B(i) - s . C(i)$. Say you have n gates. If for i = 0 to n - 1, $s . A(i) * s . B(i) - s . C(i)$ = 0, then s must satisfy all the constraints! Don't believe me? Let's do a quick proof

<!-- (->) Let s satisfy the constraints and let i be from 0 to n - 1. 
Then, $s . A(i) * s . B(i) - s . C(i)$ <br />
$s . A(i) * s . B(i) = s . C(i)$  
Notice that A(i) gives the coefficient for the first term in the ith constraint formula. The same for B(i) and C(i).
So, a . A(i) * b . A(i) = c . C(i),
then, the above formula implies that  -->
<!-- TODO: -->
<br />
<br />

Let t(i) = $s . A(i) * s . B(i) - s . C(i)$. In a real Snark, we may have 100s, 1,000s, or 1,000,000s of gates. So, we are not going to check t(i) for all possible values (ZCash currently supports up to about 2 million possible i's)! What do we do instead? We take some polynomial Z, and check if t evenly divides Z. (i.e. there is no remainder). We define Z(i) = i * (i - 1) * (i - 3) ... (i - (n - 1)). Basically, Z(i) is zero for all 0 to n - 1.

Let H(i) = t(i) / Z(i).


### Reality check, why are we doing this?
<!-- TODO: unsure -->
Okay, we can prove computation now! Imagine that you are given a set a polynomial, Y(x), you can then turn that polynomial into R1CS constraints and then into QAP form giving, A(i), B(i), C(i). Now, if you can provide t(i) and an h(i) for some x, then a verifier could check that h(i) = t(i) / Z(i). Wait, it feels like a prover could fake a proof though? Well yeah, and to get around this, we will need some cryptography.

## Hiding, cryptography and making this a reality
Take hh(X), let hh be a one way function. Also, let say that hh(X) supports addition and multiplication. So, hh(a * X + b * Y) = a * hh(X) + b * hh(Z).

Now, take R = hh(t(P)) = hh(s . A(P) * s . B(P) - s . C(P)) for some point p. Then, R / hh(Z(P)) = hh(H(P)). So, if we can provide some H'=hh(H(P)) and A'=hh(s . A(P)), B'=hh(s . B(P)), and C'=hh(s . C(P)) for a set of points which satisfy A' * B' - C' = H' * hh(Z(P)), show that we know an H(P) and a s . A(P), s . B(P), and s . C(P) which satisfy the above equation. This can all be done without revealing anything about H(P) or s. (remember hh hides the values!).

Here is the thing though, if the prover knows what P is, the prover can just fake an H(P) and s which satisfies the constraints only for that one point. So, the prover can't know what P is, no one can. 

> Wait, then how can the prover calculate hh(H(P)) if the prover does not know P?
>
> Say $H(i) = i^3 + 10i + 2$. Then, $hh(H(i)) = hh(i)^3 + 10 * hh(i) + 2 * hh(1)$. So, if you know $hh(1), hh(i), hh(i^2), hh(i^3)$, you can find $hh(H(i))$ without ever knowing $i$. So, if you know $hh(1), hh(P), hh(P^2), hh(P^n)$ where n is the degree of H, you can calculate hh(H(P)) without knowing P.

This is where the concept of a trusted setup comes in. A trusted setup is something that happens once when creating a prover system.
In the setup, a random point P is chosen and then discarded forever (its called toxic waste). What is kept though is the following calculations: hh(1), hh(P), hh($P^2$), ..., hh($P^{n - 1}$) where n is the total number of constraints a system wants to support. As previously mentioned, this number goes up to about 2 million in ZCash's trusted setup. These values are made publicly available to all. If anyone was to ever find out the P value, __the entire ZK-Snark system becomes insecure__ as mentioned above. Check out Zk-Starks for an alternative which do not require a trusted setup.

<details>
  <summary>Just for fun: ZCash's trusted setup ceremony</summary>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/O8QA6Nvg8RI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</details>
<br />

> ### An aside, properties of hh
> Not to get too involved with the hiding function, just know this.
>
> hh must have the linearity property. So, hh(a * x1 + b * x2) = hh(a) * hh(x1) + hh(b) * hh(x2).
>
> hh usually maps some values into a different Field (i.e. not the integers or real numbers)
>
> With the notation used above (sometimes exponentiation is used instead of *), we assume that Division is a hard problem
>
> In general, elliptic curves and pairings are used to implement the hh function. But, this is outside the scope of this document. For more information, check out [Vitalik Buterin's blogpost](https://medium.com/@VitalikButerin/zk-snarks-under-the-hood-b33151a013f6) on it

### Knowledge of coefficient
A quick reality check: A', B', C', and hh(H(P)) are just numbers. So, we do not have a guarantee that A', B', C', and hh(H(P)) were calculated using the same constraints and **s**. This is where something called the knowledge of coefficient comes in.

Let A'(i) = s . A(i) <br/>
Let B'(i) = s . B(i)
<br />
Let C'(i) = s . C(i)
<br />
Let $K'(i) = s . [K_{0}(i) K_{1}(i) ... K_{n - 1}(i)]$ where each $K_k(i) = A_k(i) + B_k(i) + C_k(i)$.


And, let K'(i) = A'(i) + B'(i) + C'(i)

Then, hh(K'(i)) = hh(A'(i)) + hh(B'(i)) + hh(C'(i)).

Okay okay, now to introduce one more idea.

Take B = u * P. Then, hh(B) = hh(u * P).

Then, for some F, R where hh(F) = hh(u * R). So then for some q:
<br/>q * hh(B) = hh(F) = q * hh(u * P) = hh(u * R) = hh(u) * hh(R).

Then, if you only know hh(B) and hh(P), the only way to get hh(F) and hh(R) is to multiply hh(B) * q and hh(P) * q. 

Lets come back to A'(P). Let Y1 = hh(A'(P)) and $Y2 = hh (u * A'(P)) = hh(u * s_0 * A_0(i)) + hh(u * s_1 * A_1(i)) + ... + hh(u * s_{n - 1} * A{n - 1}(i))))$. Then, if Y2 = hh(u) * Y1, you know that the A'(P) is indeed made from a linear combination of all the $A_k$.
<!-- was indeed used in calculating both Y1 and Y2. Notice that there is nothing revealed about A'(P) in this calculation! -->

> Proof: Let A'(P) used to calculate Y1 be X and A'(P) used to calculate Y2 be Z. AFSOC, that you could have Y2 = hh(u) * Y1 where X does not equal Z.
>
> Then, $hh(u) * Y1 = hh(u) * hh(A'(P)) = hh(u) * (hh(s_0 * A_0(i)) + hh(s_1 * A_1(i) + ...)) = Y2$
> Thus a contradiction is reached.

So now what? You can use the above fact to show that $A'(P)$ was made from a linear combination of $A_k(P)$, $B'(P)$ was made from a linear combination of $B_k(P)$, and $C'(P)$ was made from a linear combination of $C_k(P)$.

Then we can also prove that $K'(P) = s_0 * K_0(P) + s_1 * K_1(P) + ... + s_{n - 1}*K_{n-1}(P) = A'(P) + B'(P) + C'(P)$. What does this tell us? Well this shows us that the **s** used in calculating A', B', C', and K' is the very same.

> Proof: observe that $K'(P) = s_0 * (A_0(P) + B_0(P) + C_0(P)) + ...$ and that equals $A'(P) + B'(P) + C'(P) = s_0 * A_0(P) + s_0 * B_0(P) + s_0 * C_0(P)...$
> Then, if $hh(u * s_0 * A_0(P)) + hh(u * s_0 * B_0(P)) + hh(u * s+0 * C_0(P))... \neq hh(u) * hh(K'(P))$, then a different linear combination of terms were used in constructing $K'(P)$ as from $A'(P)$,$B'(P)$, and $C'(P)$.

Ok, now remember we defined H(i) to be (A'(i) * B'(i) - C'(i)) / Z(i).

So now what? If you know that A'(P), B'(P), and C'(P) all use the same **s**, that they indeed are a linear combination of restraints $A_k(P), B_k(P)$, and $C_k(P)$ respectively, and that A'(P) * B'(P) - C'(P) = Z(P) * H(P), then you show that you know an **s** which satisfies the restraints without ever revealing what **s** is!

> Proof: AFSOC that the prover does not know s but the above facts are true. Then, A'(P), B'(P), and C'(P) are calculated from the same s' which does not equal s. A'(P), B'(P), and C'(P) are also calculated from a linear combination of constraints on A, B, and C respectively. Then, there exits some $i \in [0, ..., n -1]$ such that $A'(i) * B'(i) - C'(i) \neq 0$ because s' does not satisfy the constraints. And look, Z(i) * H(i) must equal to zero by definition of i! This is a contradiction because $A'(P) * B'(P) - C'(P) \neq Z(P) * H(P)$. Thus the prover knows s!

### Bringing it together, a verifier and prover
So, in order for a prover to show that they know **s** which satisfies a public set of constraints in the form $A(i), B(i), C(i)$. The prover must provide the hidings of $A'(i), B'(i), C'(i), A_k(i), B_k(i), C_k(i)$, and $H(i)$ to the verifier. 

Then, the verifier does the following:

1. The verifier creates custom verification key, lets call it $u$. This $u$ cannot be known by the prover ahead of time
2. Then, the verifier can use $u$ to check that the same **s** was used to calculate A'(P), B'(P), and C'(P) (as described in the Knowledge of coefficient section) and that A'(P), B'(P), C'(P) were all calculated using $A_k(i), B_k(P), and C_k(P)$ respectively.
3. Finally, the verifier checks that A'(P)*B'(P) - C'(P) = Z(P) * H(P)

Wow! If all the checks hold for multiple P values, then the verifier can be probabilistically sure that the prover knows **s**. This is all done without revealing anything about **s**

## Usage in the wild

Today, there are many languages being put together to allow people to use ZK-Snarks in code. Many of these languages do not look like the procedural languages we are used to (like Python or C). Instead, they look more similar to HDLs (hardware description languages) SystemVerilog.

<!-- https://o1-labs.github.io/snarky/ -->
Let's look at an example from O1 Labs (a very cool company using ZK-Snarks to create a blockchain. P.S. [here is a talk](https://www.youtube.com/watch?v=gVOlQIY7_IE) that CMU Blockchain Group did with them)

This is a language called Snarky, it takes much inspiration from functional programming (O(1) lab founders are CMU alumns)
```
module M = Snarky.Snark.Run.Make(Backends.Mnt4.Default);
open M;

// Compute division by guessing the result and checking with a
// multiplication
let div = (x, y) => {
  // Non-deterministically choose a result
  let z =
    exists(Field.typ, ~compute= () => {
      Field.Constant.Infix.(
        read_var(x) / read_var(y)) // How to actually compute the result
    });

  assert_r1cs(z, y, x); // assert (z * y = x), so the result is correct
  z;
};
```
So what's going on here? 
First, the above code builds both the program necessary for the prover and the verifier.

Lets say you have Alice and Bob. Alice wants to prove that she knows $x / y$. Notice the `assert_r1cs(z, y, x)`, this signals that x = z * y is a gate. This signals to Snarky's compiler to create a series of R1CS constraints (which later get changed in QAP). Then, when Alice calls div(10, 5), the function returns 2. Then, Bob can verify that Alice indeed knows 10 / 5 by asking Alice to send over $A'(i), B'(i), C'(i), A_k(i), B_k(i), C_k(i)$, and $H(i)$ we discussed above.

Woh, this is kinda cool. We just proved computation!

<!-- TODOs: -->
<!-- Go through all the example todos and fill them in -->
<!-- Finish up the putting it all together -->
<!-- Example for knowledge coefficients -->
<!-- Put in videos -->
<!-- Clean up -->

## Check your understanding