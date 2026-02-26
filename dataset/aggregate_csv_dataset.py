import pandas as pd
import os
import glob

dataset_dir = r'l:\Synchronize4.0\dataset'
files = glob.glob(os.path.join(dataset_dir, '*.csv'))

all_data = []

for file in sorted(files):
    print(f"Reading {os.path.basename(file)}...")
    try:
        # Some characters may not be valid utf-8, ignore errors
        df = pd.read_csv(file, encoding='utf-8', encoding_errors='ignore')
        all_data.append(df)
        print(f"  Successfully loaded {df.shape[0]} rows and {df.shape[1]} columns.")
    except Exception as e:
        print(f"Error reading {os.path.basename(file)}: {e}")

if all_data:
    final_df = pd.concat(all_data, ignore_index=True)
    
    # Optional cleanup: remove rows where everything is NaN
    final_df.dropna(how='all', inplace=True)
    
    output_file = os.path.join(dataset_dir, 'aggregated_dataset_final.csv')
    final_df.to_csv(output_file, index=False, encoding='utf-8')
    
    print(f"\nSuccessfully aggregated {len(all_data)} files into {len(final_df)} rows.")
    print(f"Dataset saved to: {output_file}")
    
    print("\nColumns:")
    print(list(final_df.columns))
    print("\nSample Data:")
    print(final_df.head(2).to_dict(orient='records'))
else:
    print("No data was aggregated.")
