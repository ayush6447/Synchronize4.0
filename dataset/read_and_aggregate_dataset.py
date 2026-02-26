import pandas as pd
import os
import glob

dataset_dir = r'l:\Synchronize4.0\dataset'
files = glob.glob(os.path.join(dataset_dir, '*.xls'))

all_data = []

# Define meaningful column names based on the 9 target columns
columns = [
    'Registration_Number',
    'Publication_Name_English',
    'Publication_Name_Hindi',
    'Some_ID_1',
    'Some_ID_2',
    'Col_5',
    'Col_6',
    'Col_7',
    'Col_8'
]

for file in sorted(files):
    print(f"Reading {os.path.basename(file)}...")
    try:
        dfs = pd.read_html(file)
        for df in dfs:
            if df.empty: continue
            
            # Print original shape
            print(f"  Found table with shape: {df.shape}")
            
            # Ensure it has exactly 9 columns
            if df.shape[1] == 9:
                df.columns = columns
                all_data.append(df)
            else:
                 print(f"  Skipping table with {df.shape[1]} columns. Expected 9.")
            
    except Exception as e:
        print(f"Error reading {os.path.basename(file)}: {e}")

if all_data:
    final_df = pd.concat(all_data, ignore_index=True)
    
    # Remove any header rows disguised as data
    final_df = final_df[~final_df['Registration_Number'].isin(['Title-Code', '0'])]
    final_df.dropna(subset=['Registration_Number'], inplace=True)
    
    output_file = os.path.join(dataset_dir, 'aggregated_dataset.csv')
    final_df.to_csv(output_file, index=False, encoding='utf-8')
    
    print(f"\nSuccessfully aggregated tables into {len(final_df)} rows.")
    print(f"Dataset saved to: {output_file}")
    
    print("\nSample Data:")
    print(final_df.head())
else:
    print("No data was aggregated.")
