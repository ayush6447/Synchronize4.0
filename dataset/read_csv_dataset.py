import pandas as pd
import os
import glob

dataset_dir = r'l:\Synchronize4.0\dataset'
files = glob.glob(os.path.join(dataset_dir, '*.csv'))

output_path = r'C:\Users\Ayush Kumar\.gemini\antigravity\brain\105f30e3-2c76-47c4-8cb6-a152762a02bd\dataset_summary.md'

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("# Dataset Summary (CSV)\n\n")
    
    for file in sorted(files):
        f.write(f"## File: `{os.path.basename(file)}`\n")
        try:
            df = pd.read_csv(file)
            f.write(f"- **Dimensions**: {df.shape[0]} rows, {df.shape[1]} columns\n")
            
            cols = list(df.columns)
            f.write(f"- **Columns**: `{cols[:10]}`" + ("..." if len(cols) > 10 else "") + "\n")
                
            if not df.empty:
                row_data = df.iloc[0].tolist()
                row_str = str(row_data[:5])
                f.write(f"- **Sample data (first row)**: `{row_str}`\n")
            
            # Simple missing value check
            null_counts = df.isnull().sum()
            cols_with_nulls = null_counts[null_counts > 0]
            if not cols_with_nulls.empty:
                f.write(f"- **Missing Values**: Found missing values in {len(cols_with_nulls)} columns.\n")
            else:
                f.write(f"- **Missing Values**: None.\n")
                
            f.write("\n")
        except Exception as e:
            f.write(f"- **Error reading file**: {e}\n\n")

print(f"Summary written to {output_path}")
