library(tidyverse)
library(dplyr)
library(jsonlite)
library(httr)

acidLookup<-function(x){
  # For converting three letter amino acid code to single letter abbreviation
  # If a non-amino acid code string is passed in that same string will be returned
  
  acids<-c("Ile","Leu","Val","Phe","Met","Cys","Ala","Gly","Pro","Thr","Ser",
           "Tyr","Trp","Gln","Asn","His","Glu","Asp","Lys","Arg")
  abbrev<-c("I","L","V","F","M","C","A","G","P","T","S","Y","W","Q","N","H","E","D","K","R")
  
  df<-data.frame(acids,abbrev)
  
  row = df[(df$acids == x),]
  if (nrow(row) == 0){
    return(x)
  } else{
    return(row$abbrev)
  }
}




metaData = read_tsv("metaData.tsv")
final_df = data.frame()

####################################################################################
#             Make some assertions about the meta data 
####################################################################################

unique_vals <-sapply(metaData, function(x) length(unique(na.omit(x))))
na_vals <-sapply(metaData, function(x) sum(is.na(x)))

unique_vals <- sapply(metaData, function(x){
  length(unique(metaData$protein[!is.na(x)]))
}) 

if(unique_vals["protein"] != nrow(metaData)){
  stop("Every value of 'protein' column in meta data must be unique and none may be null")
}
if(unique_vals["raw_file"] != nrow(metaData)){
  stop("Every value of 'raw_file' column in meta data must be unique and none may be null")
}
if(unique_vals["gpcrdb_id"] + na_vals["gpcrdb_id"] != nrow(metaData)){
  stop("Every value of 'gpcrdb_id' column in meta data must be unique or empty")
}
if(unique_vals["gnomad_file"] + na_vals["gnomad_file"] != nrow(metaData)){
  stop("Every value of 'gnomad_file' column in meta data must be unique or empty")
}
if(unique_vals["anonymous_name"] + na_vals["anonymous_name"] != nrow(metaData)){
  stop("Every value of 'anonymous_name' column in meta data must be unique or empty")
}
print("The meta data file looks good!")


# for (file in metaData$file_name){
by(metaData, seq_len(nrow(metaData)), function(row) {
  cur_raw_file = row$raw_file
  cur_protein = row$protein
  cur_gpcr_id = row$gpcrdb_id
  cur_gnomad_file = row$gnomad_file
  cur_anonymous_name = row$anonymous_name
  
  print(cur_raw_file)
  print(cur_protein)
  print(cur_gpcr_id)
  print(cur_gnomad_file)
  
  ####################################################################################
  #                           Wrangle the raw data 
  ####################################################################################
  
  df = read_tsv(paste0("raw_data/", cur_raw_file), col_names = F)
  df %>% filter(X1 != "hgvs") -> df

  t(df) -> df
  as.data.frame(df) ->df
  
  df$id <- paste(df$V1, df$V2, sep = "_") 
  colnames(df)<-df[1,]
  df <- df[-1,]
  
  df %>% filter(value == "score") %>%
    select(-value, -condition_value) %>%
    pivot_longer(cols = c(-condition)) -> score
  score %>% filter(name != "_wt") -> score
  
  #Wrangle name column p.(A104C)
  #Into three columns
  #wt, (A)
  #pos, (104)
  #mut, (C)
  #Also get d1,d2,d3 and i1,i2,i3
  #TODO if we are going to have different insertions (other than iG, iGS, iGSG)
  # then the insertion logic needs to change
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
  
  #Get the wildtype sequence
  #We have to manually add in the M because we never mutate 
  score %>% 
    arrange(as.numeric(pos)) %>% 
    select(pos, wt) %>% 
    unique() -> ordered_wt
  sequence = paste0("M", paste0(ordered_wt$wt, collapse=""))
  
  #Get all possible combinations of mut pos and condition, 
  #This makes is so any missing mutation will have a value of NA instead of just not being present in the DF
  l <- list(condition = unique(score$condition), pos = unique(score$pos), mut = unique(score$mut))
  all_combos = do.call(expand.grid, l)
  left_join(all_combos, score)-> score
  
  ####################################################################################
  #        If Gnomad file is provided, add a frequency column
  ####################################################################################
  
  tryCatch({
    gnomad = read_csv(paste0("gnomad/",cur_gnomad_file)) %>% 
      select(`Protein Consequence`, `Allele Frequency`) %>% 
      rename(name = `Protein Consequence`,
             freq = `Allele Frequency`) -> gnomad
    
    #For mutations that occure in the same codon
    gnomad %>% 
      group_by(name) %>%
      summarise(freq = sum(freq)) -> gnomad
    
    
    #Wrangle the name format to match that of 'score'
    # condition     name        value             wt      pos   mut   final_number
    # <chr>         <chr>       <chr>             <chr>   <chr> <chr> <chr>       
    #   1 dms_1     p.(A104C)   -0.623061449046   A       104   C     NA          
    #   2 dms_1     p.(A104D)   0.533589454249    A       104   D     NA
    

    #Wrangle name column p.(A104C)
    #Into three columns
    #wt, (A)
    #pos, (104)
    #mut, (C)
    #Also get d1,d2,d3 and i1,i2,i3
    #TODO if we are going to have different insertions (other than iG, iGS, iGSG)
    # then the insertion logic needs to change
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
    
    left_join(score, gnomad, relationship = "many-to-many") -> score
    
    
    
    
  },
  error = function(cond){
    print(paste0("NO GNOMAD FILE FOUND FOR ",cur_protein))
    score$freq = NA
  })
  
  ####################################################################################
  #                 Make sure the gpcrDB is getting correct protein
  ####################################################################################
  correct_gpcrdb_id = FALSE
  if (!is.na(cur_gpcr_id)){
    
    url <- paste0("https://gpcrdb.org/services/protein/",cur_gpcr_id,"/")
    headers <- c(
      "accept" = "application/json",
      "X-CSRFToken" = "Gm0GoA6r2QO8uWdtUlkjjVPJc7Kcx6hkr3ved0fxjlN2VU3CV06BBDVLK1EUcL6g"
    )
    
    # Make the GET request
    response <- GET(url, add_headers(.headers=headers))
    
    # Check the response status
    response_status = status_code(response)
    
    json_data <- content(response, "text", encoding = "UTF-8")
    protein_data <- fromJSON(json_data)

    
    if (response_status == 200){
      correct_gpcrdb_id = protein_data$sequence == sequence
    }
  }
  
  ####################################################################################
  #              Get the intra/extra cellular domains/ BW numberings
  ####################################################################################
  
  if (correct_gpcrdb_id){
    url <- paste0("https://gpcrdb.org/services/residues/",cur_gpcr_id,"/")
    headers <- c(
      "accept" = "application/json",
      "X-CSRFToken" = "Gm0GoA6r2QO8uWdtUlkjjVPJc7Kcx6hkr3ved0fxjlN2VU3CV06BBDVLK1EUcL6g"
    )
    
    # Make the GET request
    response <- GET(url, add_headers(.headers=headers))
    
    # Check the response status
    response_status = status_code(response)
    
    json_data <- content(response, "text", encoding = "UTF-8")
    domain_data <- fromJSON(json_data)
    
    if (response_status == 200){
      domain_data %>% 
        rename(wt = amino_acid,
               pos = sequence_number,
               BW = display_generic_number) %>%
        mutate(pos = as.character(pos)) %>%
        right_join(score, by = "pos")  %>% 
        select(-wt.y) %>%
        rename(wt = wt.x) -> score
    }else{
      score$BW = NULL
      score$protein_segment = NULL
    }
  }
  
  

    
  
  ####################################################################################
  #                           Final steps
  ####################################################################################
  if (!is.na(cur_anonymous_name)){
    score$protein = cur_anonymous_name
    score$wt = "X"
  } else{
    score$protein = cur_protein
  }
  
  #Remove name column
  score %>% select(-name) -> score
  
  final_df <<- rbind(final_df, score)

})


write_csv(final_df, "dms_data_wrangled.csv")



