# Game of Life

Demo: https://jsfiddle.net/Script_Raccoon/485Ltcny/show

The [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) was invented by the mathematician John Conway. Even though the rules are very simple, very fascinating patterns can emerge from them.

On a rectangular grid with cells which are either dead or living, the next generation is computed with the following two simple rules:

-   A dead cell lives in the next generation iff it has 3 neighbors.
-   A living cell survives in the next generation iff it was 2 or 3 neighbors.

Other numbers can be chosen here as well, which leads to variants of the game.

In the demo, you can

-   create/remove living cells with your mouse
-   change the born and survive rule (see rules above)
-   see the current population and generation count
-   go to the next generation step by step
-   start the generation animation and toggle its speed
-   clear or randomize the grid
-   choose one of several beautiful presets

In the demo, the recently born cells are drawn red, the other living cells are drawn blue. The recently killed cells are drawn gray, all other dead colors are drawn white.
