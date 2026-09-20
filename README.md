Driving mileage is calculated using Geoapify's current road-network routing service in passenger-car mode with balanced routing and free-flow traffic. One-way mileage is rounded to the nearest whole mile before calculating round-trip mileage across all appointments. 

https://spencertsterling.github.io/mileage-calculator/


# How It Works 
- Calculates a drivable route between the geocoded home and provider locations and returns route distance and navigational information. 
- Specifically calculates a passenger-car route. 
- Utilizes a balanced route optimization strategy.

## Calculating Mileage
Mileage is calculated by rounding the one-way driving distance to the nearest whole mile, doubling it to account for the return trip, and multiplying that total by the number of appointments. The final mileage expense is calculated using the mileage rate entered by the user.
