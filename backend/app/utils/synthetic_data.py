import numpy as np
import pandas as pd
import random

def generate_synthetic_longitudinal_dataset(num_students=300, num_weeks=16, seed=42):
    """
    Generates realistic longitudinal attendance, academic assessment, and engagement
    data across 16 weeks for student dropout trajectory analysis.
    
    Archetypes generated:
    1. Consistently Engaged (~40%)
    2. Declining Attendance (~18%)
    3. Declining Academic Performance (~16%)
    4. Combined Decline (Severe At-Risk) (~14%)
    5. Irregular Engagement (~7%)
    6. Recovering Academic Trajectory (~5%)
    """
    np.random.seed(seed)
    random.seed(seed)

    records = []
    
    # Archetype proportions
    n_consistent = int(num_students * 0.40)
    n_att_decline = int(num_students * 0.18)
    n_grade_decline = int(num_students * 0.16)
    n_combined_decline = int(num_students * 0.14)
    n_irregular = int(num_students * 0.07)
    n_recovering = num_students - (n_consistent + n_att_decline + n_grade_decline + n_combined_decline + n_irregular)

    archetype_allocations = (
        ['consistent'] * n_consistent +
        ['att_decline'] * n_att_decline +
        ['grade_decline'] * n_grade_decline +
        ['combined_decline'] * n_combined_decline +
        ['irregular'] * n_irregular +
        ['recovering'] * n_recovering
    )
    random.shuffle(archetype_allocations)

    # First and last names for synthetic realism
    first_names = [
        "Aarav", "Ananya", "Rohan", "Sneha", "Aditya", "Priya", "Vikram", "Isha", "Rahul", "Pooja",
        "Arjun", "Kavya", "Siddharth", "Neha", "Kunal", "Riya", "Manish", "Divya", "Varun", "Tanvi",
        "Amit", "Simran", "Naveen", "Swati", "Gaurav", "Meera", "Deepak", "Anjali", "Harsh", "Shruti"
    ]
    last_names = [
        "Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Mishra", "Joshi", "Reddy", "Nair",
        "Rao", "Chopra", "Malhotra", "Kapoor", "Bhatia", "Bansal", "Mehta", "Saxena", "Agarwal", "Das"
    ]

    for idx, archetype in enumerate(archetype_allocations):
        s_num = idx + 1
        student_id = f"STD-{s_num:03d}"
        student_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        semester = random.choice([2, 4, 6])
        department = random.choice([
            "Computer Science & Engineering",
            "Information Technology",
            "Electronics & Communication",
            "Mechanical Engineering"
        ])

        # Baseline parameters per archetype
        if archetype == 'consistent':
            base_att = np.random.uniform(88, 97)
            att_slope = np.random.uniform(-0.3, 0.2)
            att_noise = 3.0

            base_grade = np.random.uniform(80, 94)
            grade_slope = np.random.uniform(-0.2, 0.3)
            grade_noise = 4.0

            base_logins = np.random.uniform(18, 28)
            base_hours = np.random.uniform(14, 22)
            base_sub_rate = np.random.uniform(92, 100)
            # Low historical dropout
            dropout_prob = 0.02

        elif archetype == 'att_decline':
            base_att = np.random.uniform(80, 88)
            att_slope = np.random.uniform(-2.8, -1.8) # Strong downward slope
            att_noise = 5.0

            base_grade = np.random.uniform(68, 78)
            grade_slope = np.random.uniform(-0.6, -0.1) # Moderate grade drift
            grade_noise = 5.0

            base_logins = np.random.uniform(14, 20)
            base_hours = np.random.uniform(10, 16)
            base_sub_rate = np.random.uniform(80, 90)
            dropout_prob = 0.48

        elif archetype == 'grade_decline':
            base_att = np.random.uniform(78, 88)
            att_slope = np.random.uniform(-0.4, 0.1) # Attendance holds steady
            att_noise = 4.0

            base_grade = np.random.uniform(75, 85)
            grade_slope = np.random.uniform(-2.6, -1.6) # Severe grade plunge
            grade_noise = 5.0

            base_logins = np.random.uniform(12, 18)
            base_hours = np.random.uniform(8, 14)
            base_sub_rate = np.random.uniform(75, 88)
            dropout_prob = 0.52

        elif archetype == 'combined_decline':
            base_att = np.random.uniform(72, 82)
            att_slope = np.random.uniform(-3.5, -2.2) # Attendance collapses
            att_noise = 6.0

            base_grade = np.random.uniform(65, 75)
            grade_slope = np.random.uniform(-3.2, -2.0) # Grades collapse
            grade_noise = 6.0

            base_logins = np.random.uniform(10, 16)
            base_hours = np.random.uniform(6, 12)
            base_sub_rate = np.random.uniform(70, 85)
            dropout_prob = 0.88 # Very high dropout

        elif archetype == 'irregular':
            base_att = np.random.uniform(65, 85)
            att_slope = np.random.uniform(-0.5, 0.5)
            att_noise = 16.0 # Wild fluctuations

            base_grade = np.random.uniform(60, 78)
            grade_slope = np.random.uniform(-0.5, 0.5)
            grade_noise = 15.0 # Erratic performance

            base_logins = np.random.uniform(8, 22)
            base_hours = np.random.uniform(6, 18)
            base_sub_rate = np.random.uniform(55, 85)
            dropout_prob = 0.40

        else: # recovering
            base_att = np.random.uniform(52, 64)
            att_slope = np.random.uniform(1.8, 2.7) # Upward turnaround
            att_noise = 5.0

            base_grade = np.random.uniform(50, 62)
            grade_slope = np.random.uniform(1.6, 2.6) # Grades recover
            grade_noise = 5.0

            base_logins = np.random.uniform(6, 12)
            base_hours = np.random.uniform(6, 10)
            base_sub_rate = np.random.uniform(60, 75)
            dropout_prob = 0.12

        # Historical dropout status is an external ground-truth validation label
        historical_dropout = 1 if np.random.rand() < dropout_prob else 0

        # Generate 16 weeks of data
        for week in range(1, num_weeks + 1):
            t = week - 1 # time index 0 to 15
            classes_held = random.choice([15, 16, 18, 20])

            # Weekly attendance percentage with bounds [10, 100]
            att_val = base_att + (att_slope * t) + np.random.normal(0, att_noise)
            att_pct = float(np.clip(att_val, 10.0, 100.0))
            classes_attended = int(round((att_pct / 100.0) * classes_held))
            classes_attended = min(classes_held, max(0, classes_attended))
            actual_att_pct = round((classes_attended / classes_held) * 100.0, 2)

            # Weekly assessment grades with bounds [15, 100]
            curr_grade_center = base_grade + (grade_slope * t)
            assign_score = float(np.clip(curr_grade_center + np.random.normal(0, grade_noise), 15.0, 100.0))
            quiz_score = float(np.clip(curr_grade_center + np.random.normal(0, grade_noise * 1.1), 10.0, 100.0))
            ia_score = float(np.clip(curr_grade_center + np.random.normal(0, grade_noise * 0.9), 15.0, 100.0))

            # LMS logins and study hours drift with attendance & engagement
            login_decay = (att_slope / 4.0) * t
            lms_logins = int(np.clip(round(base_logins + login_decay + np.random.normal(0, 3)), 1, 35))

            hours_decay = (grade_slope / 4.0) * t
            study_hours = round(float(np.clip(base_hours + hours_decay + np.random.normal(0, 2), 1.0, 28.0)), 1)

            # Assignment submission rate
            sub_decay = (att_slope * 0.8) * t
            submission_rate = round(float(np.clip(base_sub_rate + sub_decay + np.random.normal(0, 4), 15.0, 100.0)), 1)

            # Composite engagement score (0-100)
            engagement = round(
                0.35 * actual_att_pct +
                0.25 * submission_rate +
                0.20 * min(lms_logins * 3.33, 100.0) +
                0.20 * min(study_hours * 4.0, 100.0),
                2
            )

            records.append({
                "student_id": student_id,
                "name": student_name,
                "department": department,
                "semester": semester,
                "week": week,
                "classes_held": classes_held,
                "classes_attended": classes_attended,
                "attendance_percentage": actual_att_pct,
                "assignment_score": round(assign_score, 2),
                "quiz_score": round(quiz_score, 2),
                "internal_assessment_score": round(ia_score, 2),
                "lms_logins": lms_logins,
                "study_hours": study_hours,
                "assignment_submission_rate": submission_rate,
                "engagement_score": engagement,
                "historical_dropout_status": historical_dropout,
                "archetype_ground_truth": archetype # for synthetic verification
            })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_synthetic_longitudinal_dataset()
    print("Dataset generated:")
    print(f"Total rows: {len(df)}")
    print(f"Students: {df['student_id'].nunique()}")
    print(f"Dropout rate: {df.groupby('student_id')['historical_dropout_status'].first().mean():.2%}")
    print(df.head(2))
