# webware_final_project

## Tech stack
- Frontend: React
    - Additional work by Chart.js
    - CSS framework: TailwindCSS
- Backend: Express
    - JWT auth
- Database: MongoDB

## Additional Component
- Implemented Voice Entry
    - The system allow users to trigger voice capture for filling the form
    - The system display transcribed text and mapped form values before submission

# User Stories
- As a user, I want to be able to log in with my username and password so I can access my account.
- As a user, I want my log in credentials to be stored securely so my data is protected.
- As an administrator, I want to enter admissions statistics so that my school’s data is accurately reported.
- As an administrator, I want errors flagged with clear error messages before submission so that I know how to fix my problems.
- As a user, I want to select peer groups by size or region to see comparison charts and statistics so that I can evaluate our competitiveness.
- As a user, I want suspicious admissions values flagged so that I can review potential mistakes.

---------------------------------------------------------------------------------------------------
Epic 1: Authentication and role assignment
- secure login process that separates administrator role from user role

User stories:

user:
- as a user i want to be able to log in with my username and password so i can access my account
- as a user, i want my login credentials to be stored securely so my data is protected
- as a user, I want to be associated with one school's data so I can only view my schools information

administrator:
- as an administrator, i want to log in with administrative access so that i can manage benchmarking data
- as an administrator, I want role based permissions so only administrators can enter and/or change admissions statistics so that my school's data is reported accurately. 


Epic 2: Allow administrators to submit and validate benchmark data

user stories:
- as an administrator, i want to open the current years benchmarking form
- as an administrator, I want to fill out the form with multiple sections including admissions, demographics, facilities, academics, athletics 
- as an administrator, i want the system to validate numeric ranges, required fields, and logical consistency prior to submission
- as an administrator, I want errors flagged with clear error message before submission so that I know how to fix my problems
- as an administrator, i want to save and submit the form once it's complete

Epic 3: Provide school performance dashboards

user stories:
- as a user, I want to view high-level KPIs for my school such as admission rate, student/teacher ratio, and graduation rate
- as a user, i want to be able to filter dashboard data by year and category
- as a user, I want charts rendered so that i can visualize the data

Epic 4: Enable peer group comparison and analysis

user stories:
- as a user, I want to select peer groups by size or region to see comparison charts and statistics so that i can evaluate our competitiveness
- as a user, I want to see my school's data compared to peer averages
- as a user, I want peer schools to remain anonymous so that i won't be able to see individual peer schools' identities or raw data

Epic 5: Ensure data quality and detect suspicious entries

user stories:
Admin:
- as an administrator, I want suspicious admissions values flagged so that i can review any potential mistakes
- as an administrator, I want entries flagged if they are inconsistent with historical data or peer group ranges





