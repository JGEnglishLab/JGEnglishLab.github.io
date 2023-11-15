import os
import pandas as pd
import numpy as np
import math

PATH_TO_PAIRWISE_FILES = "./data/pairwise_res/"
PATH_TO_EMPIRICAL_FILES = "./data/emp_res/"
PATH_TO_META_DATA = './data/meta_data/'
PATH_TO_RESULTS = "./data"

#Get all the meta data
meta_data_dfs = []
for file_name in os.listdir(PATH_TO_META_DATA):
    if file_name.endswith(".csv"):
        cur_path = PATH_TO_META_DATA + file_name
        cur_csv = pd.read_csv(cur_path, dtype="str")
        meta_data_dfs.append(cur_csv)

final_meta_data = pd.concat(meta_data_dfs)





#If anonymous_name
#Set long_name and treatment = anonymous_name
#Set run_name = tag
#Set {treatment|run = anonymous_name|tag}
anonymous_name_dict = dict(zip(final_meta_data.treatment+"|"+final_meta_data.run_name , final_meta_data.anonymous_name+"|"+final_meta_data.tag))

def redact_data(row):
    if pd.notna(row['anonymous_name']):
        row['long_name'] = row['anonymous_name']
        row['treatment'] = row['anonymous_name']
        row['run_name'] = row['tag']
        row['concentration'] = 'Redacted'
        row['time'] = 'Redacted'
        row['cell_type'] = 'Redacted'
    return row
final_meta_data = final_meta_data.apply(redact_data, axis=1)
final_meta_data.to_csv(f"./{PATH_TO_RESULTS}/current_runs_meta_data.csv")


final_df = pd.DataFrame()

#Get all the pairwise and emperical data
count = 0
for file_name in os.listdir(PATH_TO_EMPIRICAL_FILES):
    if file_name.endswith(".csv"):
        count+=1

        cur_path = PATH_TO_EMPIRICAL_FILES + file_name
        cur_csv = pd.read_csv(cur_path)
        cur_run = file_name.split("__")[0]

        #Get all the columns we want to keep
        cur_csv = cur_csv.filter(regex='^architecture|^controls|^pval.mad|^DNA|^RNA|^statistic')

        #Rename all the statistic columns to alpha__treatment__run
        for col in cur_csv.columns:
            if col.startswith("statistic"): #Rename all statistic columns to alpha

                run_name = cur_run
                treatment = col.split("_")[1]
                treatment_name = treatment
                anonymous_name = anonymous_name_dict[f"{treatment}|{run_name}"]

                # if anonymous_name:
                if not isinstance(anonymous_name, float): #It will be a float if anonymous name is Nan
                    treatment, run_name = anonymous_name.split("|")

                cur_name = f"alpha__{treatment}__{run_name}"
                cur_csv.rename(columns={col: cur_name}, inplace=True)

                #Replace any column that ends with _{treatment} with __{treatment}__{cur_run}
                #Removes ambiguity if same treatment name show up in multiple run files
                cur_csv.rename(
                    columns={col: col.replace(f"_{treatment_name}", f"__{treatment}__{run_name}") for col in cur_csv.columns if col.endswith(f"_{treatment_name}")},
                    inplace=True)



        # cur_csv.rename(
        #     columns={col: col.replace(f"_{treatment}", f"__{treatment}__{cur_run}") for col in cur_csv.columns if
        #              col.endswith(f"_{treatment}")},
        #     inplace=True)

        if count == 1:
            final_df = cur_csv
        else:
            final_df = final_df.merge(cur_csv, how="outer", on=["architecture", "controls"])


for file_name in os.listdir(PATH_TO_PAIRWISE_FILES):
    if file_name.endswith(".csv"):
        base_treatment, base_run = file_name.replace(".csv","").split("_vs_")[0].split("__")
        stim_treatment, stim_run = file_name.replace(".csv","").split("_vs_")[1].split("__")


        if not isinstance(anonymous_name_dict[f"{stim_treatment}|{stim_run}"], float):  # It will be a float if anonymous name is Nan
            stim_treatment, stim_run = anonymous_name_dict[f"{stim_treatment}|{stim_run}"].split("|")

        if not isinstance(anonymous_name_dict[f"{base_treatment}|{base_run}"], float):  # It will be a float if anonymous name is Nan
            base_treatment, base_run = anonymous_name_dict[f"{base_treatment}|{base_run}"].split("|")

        cur_path = PATH_TO_PAIRWISE_FILES + file_name
        cur_csv = pd.read_csv(cur_path)
        cur_csv[['motif', 'not']] = cur_csv['architecture'].str.split(":", expand=True)


        ranked_df = cur_csv[["logFC", "statistic", "architecture", "motif", "fdr", "df.dna"]]

        max_stat = ranked_df["statistic"].max()
        max_logFC = abs(ranked_df["logFC"]).max()


        def get_architecture_stat(row, max_stat, max_logFC):
            return (row['statistic'] / max_stat) * (abs(row['logFC']) / max_logFC)


        # Value = (Original Value - Min Value) / (Max Value - Min Value)

        # ranked_df['arch_score'] = (abs(ranked_df['logFC']) / abs(ranked_df['logFC']).max()) *((ranked_df['statistic'] - ranked_df['statistic'].min()) / (ranked_df['statistic'].max() - ranked_df['statistic'].min()))
        ranked_df['arch_score'] = (abs(ranked_df['logFC']) * ranked_df['statistic'])

        # (ranked_df['logFC'] / ranked_df['logFC'])) * (ranked_df['statistic'].max()/ ranked_df['statistic'])

        # ranked_df.apply(lambda row: get_architecture_stat(row, max_stat, max_logFC), axis=1)

        summary_df = ranked_df[ranked_df['fdr'] <= .05]
        # summary_df = summary_df.groupby('motif')['logFC'].agg(lambda x: np.nanmax(np.abs(x)))
        summary_df = summary_df.groupby('motif')['arch_score'].agg(lambda x: np.nanmax(np.abs(x)))

        summary_df = summary_df.to_frame().reset_index()
        # summary_df = summary_df.rename(columns={'logFC': 'max'})
        summary_df = summary_df.rename(columns={'arch_score': 'max'})

        summary_df['max_rank'] = summary_df['max'].rank(method='max', ascending = False)
        ranked_df = pd.merge(ranked_df,summary_df, how='left', on='motif')


        ranked_df = ranked_df[["logFC", "statistic", "architecture", "max", "max_rank", "fdr"]]

        fdr_new = f"fdr__{base_treatment}__{base_run}_vs_{stim_treatment}__{stim_run}"
        statistic_new = f"statistic__{base_treatment}__{base_run}_vs_{stim_treatment}__{stim_run}"
        logFC_new = f"logFC__{base_treatment}__{base_run}_vs_{stim_treatment}__{stim_run}"
        max_new = f"max__{base_treatment}__{base_run}_vs_{stim_treatment}__{stim_run}"
        max_rank_new = f"maxRank__{base_treatment}__{base_run}_vs_{stim_treatment}__{stim_run}"


        ranked_df.rename(columns={"fdr": fdr_new, "logFC": logFC_new, "max_rank": max_rank_new,"max": max_new, "statistic": statistic_new}, inplace = True)

        final_df = final_df.merge(ranked_df, how="outer", on="architecture")


final_df[['motif', 'not']] = final_df['architecture'].str.split(":", expand=True)
final_df.drop(['not'], axis=1)
final_df.to_csv(f"./{PATH_TO_RESULTS}/current_runs.csv")


#Wrangle the data for the heat map.
filter_col = [col for col in final_df if col.startswith('alpha_') or col == "motif" or col == "architecture" or col == "controls"]

alpha_df = final_df[filter_col]
melted_df = pd.melt(alpha_df, id_vars=['architecture', 'motif', 'controls'], var_name='alpha', value_name='Value')
melted_df.to_csv(f"./{PATH_TO_RESULTS}/current_runs_alpha_data.csv")

