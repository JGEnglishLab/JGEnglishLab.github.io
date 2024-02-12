library(tidyverse)
library(dplyr)

metaData = read_tsv("metaData.tsv")
final_df = data.frame()
for (file in metaData$file_name){

  
  df = read_tsv(paste0("raw_data/", file), col_names = F)
  df %>% filter(X1 != "hgvs") -> df
  
  metaData %>%
    filter(file_name == file) -> cur_row 
  
  cur_protein = cur_row$protein
    
  t(df) -> df
  as.data.frame(df) ->df
  
  df$id <- paste(df$V1, df$V2, sep = "_") 
  
  colnames(df)<-df[1,]
  
  df <- df[-1,]
  
  # df %>% filter(value == "SE") %>%
  #   select(-value, -condition_value) %>%
  #   pivot_longer(cols = c(-condition)) %>%
  #   mutate(type = "SE")  -> SE
  # 
  # df %>% filter(value == "epsilon") %>%
  #   select(-value, -condition_value) %>%
  #   pivot_longer(cols = c(-condition)) %>%
  #   mutate(type = "epsilon") -> epsilon
  
  df %>% filter(value == "score") %>%
    select(-value, -condition_value) %>%
    pivot_longer(cols = c(-condition)) -> score
  score %>% filter(name != "_wt") -> score
  
  score %>% 
    mutate(wt = str_extract(name, "p\\.\\(.")) %>%
    mutate(wt = gsub("p\\.\\(", "", wt) ) %>%
    mutate(pos = str_extract(name, "p\\.\\(.\\d+")) %>% 
    mutate(pos = gsub("p\\.\\(.", "", pos)) %>% 
    mutate(mut = gsub("p\\.\\(.\\d+", "", name)) %>% 
    mutate(mut = gsub(")", "", mut)) %>%
    mutate(final_number = str_extract(mut, "\\d+"))%>%
    mutate(mut = case_when(
      mut == "del" ~ "d1",
      # endsWith(mut, "insG") ~ "iG",
      # endsWith(mut, "insGS") ~ "iGS",
      # endsWith(mut, "insGSG") ~ "iGSG",
      # Trying out shorter names for vis
      endsWith(mut, "insG") ~ "i1",
      endsWith(mut, "insGS") ~ "i2",
      endsWith(mut, "insGSG") ~ "i3",
      endsWith(mut, "del") & as.numeric(final_number)-as.numeric(pos) ==1 ~ "d2",
      endsWith(mut, "del") & as.numeric(final_number)-as.numeric(pos) ==2 ~ "d3",
      TRUE ~ mut
    ))-> score
  
  
  tryCatch({
    gnomad = read_csv(paste0("gnomad/",cur_row$gnomad_file)) %>% 
      select(`Protein Consequence`, `Allele Frequency`) %>% 
      rename(name = `Protein Consequence`,
             freq = `Allele Frequency`) -> gnomad
    
    
    #Wrangle the name format to match that of 'score'
    # condition     name        value             wt      pos   mut   final_number
    # <chr>         <chr>       <chr>             <chr>   <chr> <chr> <chr>       
    #   1 dms_1     p.(A104C)   -0.623061449046   A       104   C     NA          
    #   2 dms_1     p.(A104D)   0.533589454249    A       104   D     NA
    
    
    
    gnomad %>%
      mutate(wt = str_extract(name, "p\\.\\D{3}")) %>%
      mutate(wt = gsub("p\\.", "", wt)) %>%
      mutate(pos = str_extract(name, "p\\.\\D{3}\\d+")) %>% 
      mutate(pos = gsub("p\\.\\D{3}", "", pos)) %>% 
      mutate(mut = gsub("p\\.\\D{3}\\d+", "", name)) %>% 
      mutate(final_number = str_extract(mut, "\\d+"))%>%
      mutate(mut = gsub("_\\D{3}\\d+ins", "ins", mut)) %>% 
      mutate(mut = case_when(
        mut == "del" ~ "d1",
        # endsWith(mut, "insG") ~ "iG",
        # endsWith(mut, "insGS") ~ "iGS",
        # endsWith(mut, "insGSG") ~ "iGSG",
        # Trying out shorter names for vis
        endsWith(mut, "insGly") ~ "i1",
        endsWith(mut, "insGlySer") ~ "i2",
        endsWith(mut, "insGlySerGly") ~ "i3",
        endsWith(mut, "del") & as.numeric(final_number)-as.numeric(pos) ==1 ~ "d2",
        endsWith(mut, "del") & as.numeric(final_number)-as.numeric(pos) ==2 ~ "d3",
        mut == "dup" & wt == "Gly" ~ "i1",
        TRUE~mut)) %>% 
      mutate(mut = sapply(.$mut, FUN = acidLookup)) %>%
      mutate(wt = sapply(.$wt, FUN = acidLookup)) %>% 
      filter(pos != 1, wt != "ter")  %>% 
      select(mut, pos, wt, freq)-> gnomad
    
    left_join(score, gnomad) -> score
    
    
    
    
  },
  error = function(cond){
    print("nope")
    score$freq = NA
  })
  
  
  
  l <- list(condition = unique(score$condition), pos = unique(score$pos), mut = unique(score$mut))
  all_combos = do.call(expand.grid, l)
  
  left_join(all_combos, score)-> score
    
  score$protein = cur_protein
  final_df = rbind(final_df, score)

  # score %>%
  #   select(pos,wt) %>% 
  #   arrange(as.numeric(pos)) %>% 
  #   unique() %>% View()
}

#DELETE LATER, JUST FOR MAKING THE EVERYTHING ANONYMOUS
final_df$wt = "X"
final_df$protein = "SECRET!"

write_csv(final_df, "dms_data_wrangled.csv")



