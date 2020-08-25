#How the RNG generator works

##Explanation
In order to verify if a position is good for the rng element, void included, we must check it in 9 different locations, with the 5th position being the position of the element itself.
```
1 2 3
4 5 6
7 8 9
```
Once a peince has been chosen at random depending on the peice itself it will then mark specific areas as void `-1` telling the generator that nothing should spawn in that location.