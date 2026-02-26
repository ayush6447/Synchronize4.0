import pandas as pd
import os
import glob

dataset_dir = r'l:\Synchronize4.0\dataset'
files = glob.glob(os.path.join(dataset_dir, '*.xlsx'))

all_data = []

for file in sorted(files):
    print(f"Reading {os.path.basename(file)}...")
    try:
        df = pd.read_excel(file)
        all_data.append(df)
        print(f"  Successfully loaded {df.shape[0]} rows and {df.shape[1]} columns.")
    except Exception as e:
        print(f"Error reading {os.path.basename(file)}: {e}")

if all_data:
    final_df = pd.concat(all_data, ignore_index=True)
    
    # Optional cleanup: remove rows where everything is NaN
    final_df.dropna(how='all', inplace=True)
    
    # Save as CSV with utf-8-sig encoding (Excel treats utf-8-sig correctly for Hindi)
    output_file_csv = os.path.join(dataset_dir, 'aggregated_dataset_hindi.csv')
    final_df.to_csv(output_file_csv, index=False, encoding='utf-8-sig')
    
    # Also save as Excel just in case
    output_file_xlsx = os.path.join(dataset_dir, 'aggregated_dataset_hindi.xlsx')
    final_df.to_excel(output_file_xlsx, index=False)
    
    print(f"\nSuccessfully aggregated {len(all_data)} files into {len(final_df)} rows.")
    print(f"Dataset saved to: {output_file_csv} and {output_file_xlsx}")
    
else:
    print("No data was aggregated.")
