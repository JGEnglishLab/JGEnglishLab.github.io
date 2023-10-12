const helpers = {
    filter_comparison_data: function(all_data, base_treatment, stim_treatment, base_run, stim_run, selected_motif, min_RNA, min_DNA){
        //Takes all the data from for alpha/volcano and filters it.
        //Returns filtered data frame.

        let selected_comparison = base_treatment+"__"+base_run+"_vs_"+stim_treatment+"__"+stim_run
        let stim_name = "alpha__"+stim_treatment+"__"+stim_run
        let base_name = "alpha__"+base_treatment+"__"+base_run
        let n_rna_stim_name = "RNA_barcodes__" +stim_treatment+"__"+stim_run
        let n_rna_base_name = "RNA_barcodes__" +base_treatment+"__"+base_run
        let n_dna_stim_name = "DNA_barcodes__" +stim_treatment+"__"+stim_run
        let n_dna_base_name = "DNA_barcodes__" +base_treatment+"__"+base_run
        let logFC_col = "logFC__"+selected_comparison
        let pval_col = "statistic__"+selected_comparison
        let statistic_name = "statistic__"+selected_comparison

        //Make sure that the log fc and pval are there
        //For some architectures MPRAnalyze doesn't call an alpha or fc
        //We don't want those 
        let selected_data = all_data.filter(function(d){return d[base_name]!= "";})
        selected_data = selected_data.filter(function(d){return d[stim_name] != "";})
        selected_data = selected_data.filter(function(d){return d[pval_col]!= "";})
        selected_data = selected_data.filter(function(d){return d[logFC_col] != "";})

        //Filter for DNA and RNA counts
        selected_data = selected_data.filter(function(d){return Math.floor(d[n_rna_stim_name]) >= Math.ceil(min_RNA)})
        selected_data = selected_data.filter(function(d){return Math.floor(d[n_rna_base_name]) >= Math.ceil(min_RNA)})
        selected_data = selected_data.filter(function(d){return Math.floor(d[n_dna_stim_name]) >= Math.ceil(min_DNA)})
        selected_data = selected_data.filter(function(d){return Math.floor(d[n_dna_base_name]) >= Math.ceil(min_DNA)})

        //Get max and min statistics before filtering for motif
        let max_statistic = d3.max(selected_data.map(d => +d[statistic_name]))
        let min_statistic = d3.min(selected_data.map(d => +d[statistic_name]))

        let log_fold_changes = selected_data.map(d => d[logFC_col])
        let max_fc = d3.max(log_fold_changes.map(d=> Number(d)))
        let min_fc = d3.min(log_fold_changes.map(d=> Number(d)))

        if (min_statistic >= 0){
            min_statistic = 0
        }
        else{ //Get the lower quartile
            min_statistic = d3.max([-(.2*max_statistic), min_statistic])
        }

        //Cut off anything that will dip below the min pval
        selected_data = selected_data.filter(function(d){return d[statistic_name]>=min_statistic;})
        let motifs = [...new Set(selected_data.map((item) => item.motif))];

        
        // If there is a highlighted motif, filter for it.
        if (selected_motif != "none"){
            selected_data = selected_data.filter(function(d){return d.motif == selected_motif})
        }

        return [selected_data, motifs, max_statistic, min_statistic, max_fc, min_fc]



    }
   
}

export default helpers;