# Mapty - Workout Tracking App

Mapty is a workout tracking application that allows users to record workouts (running and cycling) and visualize them on a map. This project is based on Jonas Schmedtmann's original version with additional features for editing and deleting workouts without refreshing the page (using DOM Manipulation).
## Demo
https://maptis.netlify.app/

## Features

- **Record Workouts**: Users can record different types of workouts by selecting the workout type, distance, duration, and location on the map.

- **View Workouts**: Recorded workouts are displayed on the map with markers, providing a visual representation of the user's exercise history.

- **Go to Workouts**: Clicking on the workout in the workouts list, will modify the map so that that the workout clicked on would be shown in the center of the map.

- **Edit Workouts**: Added functionality allows users to edit the details of a workout directly within the interface without refreshing the page. This includes modifying workout type, distance, duration, and location.

- **Delete Workouts**: Users have the option to delete individual workouts or clear all workouts at once, all without the need to refresh the page.

## Getting Started

To run the Mapty project locally or deploy it to a server, follow these steps:

1. Clone the repository to your local machine:
   ```
   git clone https://github.com/Pullsard/mapty.git
   ```

2. Navigate to the project directory:
   ```
   cd mapty
   ```

3. Open the `index.html` file in your web browser to launch the application.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet.js (for map functionality)
- localStorage API(for storing data between sessions)

## Project Structure

The project directory structure is as follows:

- **index.html**: The main HTML file that contains the structure of the application.
- **style.css**: The CSS file for styling the application.
- **script.js**: The JavaScript file that contains the application logic and functionality.

## Credits

This project is based on Jonas Schmedtmann's original Mapty project from his "The Complete JavaScript Course 2022: From Zero to Expert!" course on Udemy. Additional features were implemented for editing and deleting workouts, to personalize the project, and improve its functionality. 
