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
  
  score$protein = cur_protein
  final_df = rbind(final_df, score)
  
  # score %>%
  #   select(pos,wt) %>% 
  #   arrange(as.numeric(pos)) %>% 
  #   unique() %>% View()
}

#DELETE LATER, JUST FOR MAKING THE EVERYTHING ANONYMOUS
final_df$wt = "X"
final_df$protein = "ZUKO"

write_csv(final_df, "dms_data_wrangled.csv")



