# Coffee Drip Calculator Dashboard - Requirements

Lately, whenever I brew pourover coffee, I always have to do all the math manually. 

For example, if I use 10g of coffee and want a 1:17.5 ratio, I have to calculate $10 \times 17.5 = 175$ (total water). If I want to bloom with 20g of water, I then have to calculate $175 - 20 = 155$. Then, if I want to split the remaining water into 4 pours, I have to calculate $155 / 4 = 38.75$. 

Of course, to track the scale during the brew, I need to add $20 + 38.75 = 58.75$ for the first pour, and then keep adding 38.75 for each subsequent pour until I reach the total volume. 

It’s exhausting. So, I want a simple dashboard that takes the following inputs:

1. **Coffee:** $x$ grams
2. **Ratio:** 1:$y$
3. **Bloom:** $z$ grams
4. **Number of pours** (excluding bloom)
5. **(Advanced option):** Bloom time and estimated total brew time

---

### UI & Input Requirements

*   **Inputs 1, 2, and 4** should use a **scroll wheel (picker view)**.
    *   **Coffee range:** 8g to 25g
    *   **Ratio range:** 1:2 to 1:20
    *   **Number of pours range:** 1 to 10
*   **Input 3 (Bloom)** can be a standard **number input**.
*   **Input 5 (Advanced option)** should have a **checkbox or a toggle switch** to make it optional. 
    *   If unchecked, ignore it. 
    *   If checked, include it in the calculation. The time inputs should also use a scroll wheel.

---

### Output & Logic Requirements

*   The output should display the exact water amount for the bloom and for each individual pour based on the specified number of pours. Displaying this in a **table format** would be ideal.
*   **Advanced Time Logic:** If the bloom time and estimated total time are provided, subtract the bloom time from the total time, and then evenly distribute the remaining time across the subsequent pours.

> **Note on UI/UX:** As for the design, I’ll leave that entirely up to you. I’m not great at design—I’m just a regular software engineer.